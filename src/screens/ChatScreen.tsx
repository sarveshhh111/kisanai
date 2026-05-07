import React, { useState, useRef, useEffect } from 'react';
import {
  View, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInUp, useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, withDelay, Easing,
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { BodyText, Caption, H2 } from '../components/Typography';
import { useStore } from '../store/useStore';

// ─── Typing Indicator ─────────────────────────────────────────────────────────
// Each dot gets its OWN top-level useAnimatedStyle (Rules of Hooks compliant)
const TypingIndicator = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const anim = (sv: typeof dot1, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0, { duration: 400 })
          ),
          -1,
          true
        )
      );
    };
    anim(dot1, 0);
    anim(dot2, 200);
    anim(dot3, 400);
  }, []);

  // ✅ Each style is its own top-level hook call — Rules of Hooks compliant
  const style1 = useAnimatedStyle(() => ({
    transform: [{ scale: dot1.value * 0.5 + 0.5 }],
    opacity: dot1.value * 0.5 + 0.5,
  }));
  const style2 = useAnimatedStyle(() => ({
    transform: [{ scale: dot2.value * 0.5 + 0.5 }],
    opacity: dot2.value * 0.5 + 0.5,
  }));
  const style3 = useAnimatedStyle(() => ({
    transform: [{ scale: dot3.value * 0.5 + 0.5 }],
    opacity: dot3.value * 0.5 + 0.5,
  }));

  return (
    <View className="flex-row items-center px-4 py-3 bg-white self-start rounded-[16px] rounded-tl-none border border-theme-border shadow-sm mb-4">
      <Animated.View style={style1} className="w-2 h-2 rounded-full bg-theme-muted mx-0.5" />
      <Animated.View style={style2} className="w-2 h-2 rounded-full bg-theme-muted mx-0.5" />
      <Animated.View style={style3} className="w-2 h-2 rounded-full bg-theme-muted mx-0.5" />
    </View>
  );
};

// ─── Mic Pulse ────────────────────────────────────────────────────────────────
const MicPulse = () => {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.4,
  }));
  return (
    <Animated.View
      style={[style, { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: '#16A34A' }]}
    />
  );
};

// ─── Language map for TTS ─────────────────────────────────────────────────────
const SPEECH_LANG: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
};

/** Cross-platform TTS helper */
const playSpeech = (text: string, lang: string) => {
  if (Platform.OS === 'web') {
    // Use browser SpeechSynthesis API (Chrome, Edge, Safari)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
  } else {
    Speech.speak(text, { language: lang, rate: 0.9 });
  }
};

const stopSpeech = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } else {
    Speech.stop();
  }
};

// ─── Main ChatScreen ──────────────────────────────────────────────────────────
export default function ChatScreen({ navigation }: any) {
  const { messages, isTyping, addMessage, profile } = useStore();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [messages, isTyping]);

  // Stop speech when unmounting
  useEffect(() => {
    return () => { stopSpeech(); };
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    addMessage({ text: inputText.trim(), sender: 'user' });
    setInputText('');
  };

  // ── TTS: Read bot message aloud ───────────────────────────────────────────
  const handleSpeak = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      stopSpeech();
      setSpeakingId(null);
      return;
    }
    stopSpeech();
    setSpeakingId(msgId);
    playSpeech(text, SPEECH_LANG[profile.language] ?? 'hi-IN');
    // Auto-clear speaking indicator after estimated duration
    const estimatedMs = Math.max(2000, text.length * 60);
    setTimeout(() => setSpeakingId(null), estimatedMs);
  };

  // ── Voice Input ───────────────────────────────────────────────────────────
  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (Platform.OS === 'web') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) {
        Alert.alert('Voice Input', 'Aapka browser voice input support nahi karta. Chrome use karein.');
        return;
      }
      const recognition = new SR();
      recognition.lang = SPEECH_LANG[profile.language] ?? 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setIsListening(true);
      recognition.onresult = (event: any) => {
        setInputText(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
        Alert.alert('Voice Error', 'Awaaz samajh nahi aayi. Phir se try karein.');
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      // Native: open a focused text input prompt
      Alert.alert(
        '🎙️ Awaaz se Poochein',
        'Abhi type karke poochein. Voice-to-text ke liye browser mein kholein.',
        [{ text: 'OK', style: 'cancel' }]
      );
    }
  };

  const QUICK_CHIPS = ['Mandi Bhav', 'Mausam', 'Gehu ki kheti', 'Kida rog', 'Khaad kaun si daalein'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-theme-surface"
    >
      {/* Header */}
      <View className="bg-kisan-green pt-14 pb-4 px-4 flex-row items-center shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3 relative">
          <Ionicons name="leaf" size={20} color="white" />
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#16A34A] rounded-full border-2 border-kisan-green" />
        </View>
        <View className="flex-1">
          <H2 className="text-white">Kisan AI</H2>
          <Caption className="text-white/80">Online • Hindi • English • मराठी • ગુજરાતી</Caption>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Chat Clear Karein?', 'Kya aap saari baat cheet mita dena chahte hain?', [
              { text: 'Nahi', style: 'cancel' },
              { text: 'Haan, Mita Do', style: 'destructive', onPress: () => useStore.getState().clearMessages() },
            ])
          }
          className="bg-white/20 rounded-full px-3 py-1"
        >
          <Caption className="text-white">Clear</Caption>
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((msg, index) => (
          <Animated.View
            entering={FadeInUp.delay(Math.min(index * 30, 300)).springify()}
            key={msg.id}
            className={`mb-4 max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
          >
            <View
              className={`p-3 rounded-[16px] shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-[#DCF8C6] rounded-tr-none border border-[#b2d99d]'
                  : 'bg-white rounded-tl-none border border-theme-border'
              }`}
            >
              <BodyText className="text-theme-text mb-1 leading-relaxed">{msg.text}</BodyText>
            </View>

            <View className={`flex-row items-center mt-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Caption className={`${msg.sender === 'user' ? 'mr-2' : 'ml-1 mr-2'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Caption>
              {/* TTS button for bot messages */}
              {msg.sender === 'bot' && (
                <TouchableOpacity onPress={() => handleSpeak(msg.id, msg.text)}>
                  <Ionicons
                    name={speakingId === msg.id ? 'volume-high' : 'volume-medium-outline'}
                    size={16}
                    color={speakingId === msg.id ? '#1A7A4A' : '#9CA3AF'}
                  />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        ))}

        {isTyping && <TypingIndicator />}

        {/* Quick Reply Chips */}
        <Animated.View entering={FadeInUp.delay(400).springify()} className="flex-row flex-wrap mb-6 mt-2 gap-2">
          {QUICK_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              onPress={() => setInputText(chip)}
              className="bg-white border border-kisan-green px-3 py-1.5 rounded-full"
            >
              <Caption className="text-kisan-green font-medium">{chip}</Caption>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Input Bar */}
      <View className="bg-white px-4 py-3 border-t border-theme-border flex-row items-center pb-8">
        <TouchableOpacity
          onPress={handleVoiceInput}
          className="mr-3 items-center justify-center"
          style={{ width: 44, height: 44 }}
        >
          {isListening && <MicPulse />}
          <View className="w-[44px] h-[44px] rounded-full bg-kisan-green/10 items-center justify-center">
            <Ionicons
              name={isListening ? 'mic' : 'mic-outline'}
              size={24}
              color={isListening ? '#16A34A' : '#4B5563'}
            />
          </View>
        </TouchableOpacity>

        <View className="flex-1 bg-theme-surface rounded-full border border-theme-border px-4 py-2 flex-row items-center mr-3 h-[44px]">
          <TextInput
            className="flex-1 font-sans text-[14px] h-full"
            placeholder={isListening ? '🎙️ Sun raha hoon...' : 'Apna sawaal poochein...'}
            placeholderTextColor={isListening ? '#16A34A' : '#9CA3AF'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim()}
          className={`w-[44px] h-[44px] rounded-full items-center justify-center ${
            inputText.trim() ? 'bg-kisan-green' : 'bg-gray-200'
          }`}
        >
          <Ionicons name="send" size={20} color={inputText.trim() ? 'white' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
