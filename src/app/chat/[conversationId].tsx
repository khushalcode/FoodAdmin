// Chat conversation screen — V4.0 port of Flutter lib/features/chat/screens/chat_screen.dart
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import type { ChatMessage } from '@/types';

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, conversation_id: 1, sender_type: 'vendor', sender_id: '1', message: 'Hi! How can we help you today?', is_seen: true, created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 2, conversation_id: 1, sender_type: 'user', sender_id: 'me', message: 'When will my order arrive?', is_seen: true, created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString() },
  { id: 3, conversation_id: 1, sender_type: 'vendor', sender_id: '1', message: 'Your order is on the way and will arrive in about 15 minutes!', is_seen: true, created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
  { id: 4, conversation_id: 1, sender_type: 'user', sender_id: 'me', message: 'Great, thank you!', is_seen: true, created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
];

export default function ChatConversationScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      conversation_id: Number(conversationId),
      sender_type: 'user',
      sender_id: 'me',
      message: input.trim(),
      is_seen: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    // Simulate auto-reply
    setTimeout(() => {
      const reply: ChatMessage = {
        id: Date.now() + 1,
        conversation_id: Number(conversationId),
        sender_type: 'vendor',
        sender_id: '1',
        message: 'Thanks for your message! We will get back to you soon.',
        is_seen: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="store" size={20} color={Colors.primary} />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Fresh Foods Store</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <Pressable style={styles.callBtn}><Ionicons name="call" size={20} color={Colors.primary} /></Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {messages.map((m) => {
            const isMe = m.sender_type === 'user';
            return (
              <View key={m.id} style={[styles.messageRow, isMe ? styles.messageRowMe : {}]}>
                <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : {}]}>
                  <Text style={[styles.messageText, isMe ? styles.messageTextMe : {}]}>{m.message}</Text>
                  <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : {}]}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputBar}>
          <Pressable style={styles.attachBtn}><Ionicons name="add-circle-outline" size={24} color={Colors.textSecondary} /></Pressable>
          <TextInput style={styles.input} placeholder="Type a message..." value={input} onChangeText={setInput} multiline />
          <Pressable style={styles.sendBtn} onPress={handleSend}><Ionicons name="send" size={20} color={Colors.textInverse} /></Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background, gap: Spacing.sm },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.background },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  headerStatus: { fontSize: 10, color: Colors.success },
  callBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  messageRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  messageRowMe: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '80%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderBottomLeftRadius: 4 },
  messageBubbleMe: { backgroundColor: Colors.primary, borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: 4 },
  messageText: { fontSize: FontSize.sm, color: Colors.text },
  messageTextMe: { color: Colors.textInverse },
  messageTime: { fontSize: 10, color: Colors.textTertiary, marginTop: 4, textAlign: 'right' },
  messageTimeMe: { color: 'rgba(255,255,255,0.7)' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  attachBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm, color: Colors.text, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
