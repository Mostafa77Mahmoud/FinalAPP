import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';

export interface PDFGenerationOptions {
  images: string[];
  filename?: string;
  quality?: number;
}

export interface PDFResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export const generatePDFFromImages = async (options: PDFGenerationOptions): Promise<PDFResult> => {
  const { images, filename = 'contract_document', quality = 0.8 } = options;

  if (!images || images.length === 0) {
    return { success: false, error: 'No images provided' };
  }

  try {
    // Create HTML content with images
    const htmlContent = createHTMLFromImages(images);

    // Generate PDF using expo-print
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      width: 612, // Standard A4 width in points
      height: 792, // Standard A4 height in points
    });

    if (Platform.OS === 'android') {
      // For Android, save to a more accessible location
      const newUri = `${FileSystem.documentDirectory}${filename}.pdf`;
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });
      return { success: true, uri: newUri };
    }

    return { success: true, uri };
  } catch (error) {
    console.error('PDF generation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const sharePDF = async (uri: string, filename: string = 'contract'): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web sharing fallback
      const link = document.createElement('a');
      link.href = uri;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Contract PDF',
        UTI: 'com.adobe.pdf',
      });
      return true;
    } else {
      Alert.alert('Sharing not available', 'PDF saved to device storage');
      return true;
    }
  } catch (error) {
    console.error('PDF sharing failed:', error);
    Alert.alert('Share Failed', 'Could not share the PDF file');
    return false;
  }
};

const createHTMLFromImages = (images: string[]): string => {
  const imageElements = images
    .map((imageUri, index) => {
      return `
        <div style="page-break-before: ${index > 0 ? 'always' : 'auto'}; margin: 0; padding: 20px;">
          <img 
            src="${imageUri}" 
            style="
              width: 100%; 
              height: auto; 
              max-width: 100%; 
              max-height: 90vh;
              object-fit: contain;
              display: block;
              margin: 0 auto;
            " 
            alt="Contract page ${index + 1}"
          />
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contract Document</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }
          .page {
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          @media print {
            .page {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        ${imageElements}
      </body>
    </html>
  `;
};

export const generateTextDocument = async (
  text: string, 
  filename: string = 'contract_text'
): Promise<PDFResult> => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Contract Document</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .content {
              white-space: pre-wrap;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Contract Document</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="content">${text}</div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    if (Platform.OS === 'android') {
      const newUri = `${FileSystem.documentDirectory}${filename}.pdf`;
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });
      return { success: true, uri: newUri };
    }

    return { success: true, uri };
  } catch (error) {
    console.error('Text PDF generation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};