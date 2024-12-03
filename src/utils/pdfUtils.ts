import { PDFDownloadLink } from '@react-pdf/renderer';
import { Message } from '../types/chat';
import ChatPDFDocument from '../components/PDFDocument';

export const generatePDFFileName = (username: string): string => {
  const date = new Date().toISOString().split('T')[0];
  return `chat-history-${username}-${date}.pdf`;
};