import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ProposalPdfViewer = ({ documentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching document content for ID:', documentId);
      const result = await window.api.getDocumentContent(documentId);
      
      if (result.success && result.content) {
        // Convert the binary data to a Blob
        const blob = new Blob([new Uint8Array(result.content.data)], { type: 'application/pdf' });
        
        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);
        setPdfData(url);
      } else {
        throw new Error(result.error || 'Failed to load document content');
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Document Viewer
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
        {pdfData ? (
          <>
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => setError(error.message)}
              loading={<CircularProgress />}
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={600}
              />
            </Document>
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                disabled={pageNumber <= 1} 
                onClick={previousPage}
              >
                Previous
              </Button>
              
              <Typography>
                Page {pageNumber} of {numPages}
              </Typography>
              
              <Button 
                variant="outlined" 
                disabled={pageNumber >= numPages} 
                onClick={nextPage}
              >
                Next
              </Button>
            </Box>
          </>
        ) : (
          <Typography>No document available</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ProposalPdfViewer; 