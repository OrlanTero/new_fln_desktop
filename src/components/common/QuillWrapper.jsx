import React, { useState, useEffect, useRef, forwardRef } from 'react';
import 'react-quill/dist/quill.snow.css';

/**
 * QuillWrapper - A wrapper component for ReactQuill that works with React 19
 * 
 * This component addresses the findDOMNode deprecation in React 19 by:
 * 1. Using a ref to create a container div
 * 2. Manually creating and mounting the Quill editor instance
 * 3. Bypassing ReactQuill's internal use of findDOMNode
 */
const QuillWrapper = forwardRef((props, ref) => {
  const {
    value,
    onChange,
    modules,
    theme = 'snow',
    placeholder,
    readOnly = false,
    style = {},
    className = '',
    ...otherProps
  } = props;

  const containerRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const [editorContainer, setEditorContainer] = useState(null);
  
  // Create a div element for the editor only once
  useEffect(() => {
    if (containerRef.current && !editorContainer) {
      // First, clear any existing content to prevent multiple editors
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      // Create a new div element for the editor
      const editorDiv = document.createElement('div');
      editorDiv.className = 'quill-editor-container';
      
      // Append it to our container
      containerRef.current.appendChild(editorDiv);
      
      // Store the reference
      setEditorContainer(editorDiv);
    }
    
    // Cleanup function to remove the editor container
    return () => {
      if (containerRef.current && editorContainer) {
        try {
          // Destroy Quill instance if it exists
          if (quillInstanceRef.current) {
            // No explicit destroy method in Quill, but we can clean up our references
            quillInstanceRef.current = null;
          }
          
          // Remove the editor container
          if (containerRef.current.contains(editorContainer)) {
            containerRef.current.removeChild(editorContainer);
          }
        } catch (e) {
          console.warn('Error removing editor container:', e);
        }
      }
    };
  }, []);
  
  // Initialize Quill directly
  useEffect(() => {
    if (!editorContainer) return;
    
    // If we already have a Quill instance, don't create another one
    if (quillInstanceRef.current) return;
    
    // Import Quill directly to bypass ReactQuill's findDOMNode usage
    const Quill = require('quill');
    
    // Create Quill instance
    const quill = new Quill(editorContainer, {
      theme: theme,
      modules: modules,
      placeholder: placeholder,
      readOnly: readOnly,
      ...otherProps
    });
    
    // Store the Quill instance
    quillInstanceRef.current = quill;
    
    // Set initial content
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }
    
    // Set up change handler
    quill.on('text-change', () => {
      const html = editorContainer.querySelector('.ql-editor').innerHTML;
      if (onChange) {
        onChange(html);
      }
    });
    
    // Cleanup function
    return () => {
      quillInstanceRef.current = null;
    };
  }, [editorContainer]);
  
  // Update content when value changes
  useEffect(() => {
    if (!editorContainer || !quillInstanceRef.current) return;
    
    const editor = editorContainer.querySelector('.ql-editor');
    if (editor && editor.innerHTML !== value) {
      // Use the Quill API to update content to avoid issues
      quillInstanceRef.current.clipboard.dangerouslyPasteHTML(value || '');
    }
  }, [value, editorContainer]);

  // Handle ref forwarding
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(containerRef.current);
      } else {
        ref.current = containerRef.current;
      }
    }
  }, [ref, containerRef.current]);

  return (
    <div 
      ref={containerRef}
      className={`quill-wrapper ${className}`}
      style={{ 
        ...style,
        // Add some default styling to match ReactQuill
        ...(style.height ? {} : { minHeight: '200px' })
      }}
    />
  );
});

QuillWrapper.displayName = 'QuillWrapper';

export default QuillWrapper; 