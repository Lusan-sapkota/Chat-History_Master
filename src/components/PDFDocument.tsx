import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Message } from '../types/chat';
import { formatDate } from '../utils/chatUtils';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  message: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  from: {
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
  },
  content: {
    lineHeight: 1.5,
  },
});

interface PDFDocumentProps {
  username: string;
  messages: Message[];
}

const ChatPDFDocument: React.FC<PDFDocumentProps> = ({ username, messages }) => {
  const userMessages = messages.filter(m => m.From === username).length;
  const otherMessages = messages.length - userMessages;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat History with {username}</Text>
          <View style={styles.stats}>
            <Text>Total Messages: {messages.length}</Text>
            <Text>User Messages: {userMessages}</Text>
            <Text>Other Messages: {otherMessages}</Text>
          </View>
        </View>

        {messages.map((message, index) => (
          <View key={index} style={styles.message}>
            <View style={styles.messageHeader}>
              <Text style={styles.from}>{message.From}</Text>
              <Text style={styles.date}>{formatDate(message.Date)}</Text>
            </View>
            <Text style={styles.content}>{message.Content}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default ChatPDFDocument;