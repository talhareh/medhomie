import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createReactEditorJS } from 'react-editor-js';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Image from '@editorjs/image';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Delimiter from '@editorjs/delimiter';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';
import Paragraph from '@editorjs/paragraph';
import { BlogFormData, uploadBlogImage } from '../../services/blogService';
import { getImageUrl } from '../../utils/imageUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faImage, 
  faTags, 
  faClock,
  faFileAlt,
  faEdit,
  faCloudUpload,
  faCog
} from '@fortawesome/free-solid-svg-icons';

// Create ReactEditorJS component
const ReactEditorJS = createReactEditorJS();

interface BlogEditorProps {
  initialData?: Partial<BlogFormData>;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ initialData, onSubmit, isSubmitting }) => {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:37',message:'BlogEditor component mounted',data:{hasInitialData:!!initialData},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  }, []);
  // #endregion
  const [imageUploading, setImageUploading] = useState(false);
  const editorInstance = useRef<any>(null);
  const { register, handleSubmit, setValue, watch } = useForm<BlogFormData>({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      featuredImage: initialData?.featuredImage || '',
      status: initialData?.status || 'DRAFT',
      tags: initialData?.tags || [],
      readTime: initialData?.readTime || 5
    }
  });

  const featuredImage = watch('featuredImage');
  const tags = watch('tags') || [];
  const tagsString = Array.isArray(tags) ? tags.join(', ') : '';

  // Log component render and key values
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:56',message:'BlogEditor render - checking values',data:{hasInitialData:!!initialData,hasReactEditorJS:!!ReactEditorJS},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  }, []);

  // Parse initial content - handle both JSON string and object (memoized to prevent re-renders)
  const initialContent = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:57',message:'getInitialContent called',data:{hasInitialData:!!initialData?.content,initialDataType:typeof initialData?.content},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (!initialData?.content) {
      const emptyContent = { blocks: [] };
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:60',message:'returning empty content',data:{content:emptyContent},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return emptyContent; // Return empty blocks array instead of null
    }
    
    try {
      // If it's already an object, return it
      if (typeof initialData.content === 'object') {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:68',message:'returning object content',data:{contentType:'object'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return initialData.content;
      }
      
      // If it's a string, try to parse it
      if (typeof initialData.content === 'string') {
        const parsed = JSON.parse(initialData.content);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:75',message:'parsed string content',data:{parsedContent:parsed},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return parsed;
      }
      
      return { blocks: [] }; // Return empty blocks array instead of null
    } catch (error) {
      // If parsing fails, return empty editor
      console.warn('Failed to parse initial content:', error);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:82',message:'parse error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return { blocks: [] }; // Return empty blocks array instead of null
    }
  }, [initialData?.content]);

  // Image upload handler for Editor.js Image tool
  const handleImageUpload = useCallback(async (file: File): Promise<{ success: number; file: { url: string } }> => {
    try {
      setImageUploading(true);
      const response = await uploadBlogImage(file);
      // Backend returns path like /uploads/blogs/... - convert to /api/uploads/blogs/... for display
      const imagePath = response.data.url.replace('uploads/', '/api/uploads/');
      
      return {
        success: 1,
        file: {
          url: imagePath
        }
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  }, []);

  // Editor.js tools configuration
  const tools = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:104',message:'tools configuration created',data:{toolCount:Object.keys({paragraph:{class:Paragraph},header:{class:Header},list:{class:List},quote:{class:Quote},image:{class:Image},code:{class:Code},inlineCode:{class:InlineCode},delimiter:Delimiter,marker:{class:Marker},underline:Underline}).length},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return {
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      },
      header: {
        class: Header,
        config: {
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 2
        },
        inlineToolbar: true,
      },
      list: {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered'
        }
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+O',
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: 'Quote\'s author',
        },
      },
      image: {
        class: Image,
        config: {
          uploader: {
            uploadByFile: handleImageUpload,
          },
          captionPlaceholder: 'Optional caption',
        }
      },
      code: {
        class: Code,
        config: {
          placeholder: 'Enter code',
        }
      },
      inlineCode: {
        class: InlineCode,
        shortcut: 'CMD+SHIFT+M',
      },
      delimiter: Delimiter,
      marker: {
        class: Marker,
        shortcut: 'CMD+SHIFT+M',
      },
      underline: Underline,
    };
  }, [handleImageUpload]);

  // Log before ReactEditorJS render
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:253',message:'ReactEditorJS render check',data:{initialContent,toolsKeys:Object.keys(tools),hasReactEditorJS:!!ReactEditorJS},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  }, [initialContent, tools]);

  // #region agent log
  // Check container DOM before editor renders
  useEffect(() => {
    const container = document.getElementById('editorjs-container');
    if (container) {
      const styles = window.getComputedStyle(container);
      fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:288',message:'Container DOM check before editor',data:{containerExists:!!container,pointerEvents:styles.pointerEvents,zIndex:styles.zIndex,position:styles.position,display:styles.display,width:styles.width,height:styles.height},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
    }
  }, []);
  // #endregion

  // #region agent log
  // Post-render editor check
  useEffect(() => {
    const checkEditor = () => {
      const container = document.getElementById('editorjs-container');
      const editorEl = container?.querySelector('.codex-editor');
      const blocks = container?.querySelectorAll('.ce-block');
      fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:320',message:'Post-render editor check',data:{hasContainer:!!container,hasEditorEl:!!editorEl,blockCount:blocks?.length||0,reactEditorRendered:true},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    };
    const timer = setTimeout(checkEditor, 2000);
    return () => clearTimeout(timer);
  }, []);
  // #endregion

  const handleFormSubmit = async (data: BlogFormData) => {
    try {
      // Get content from Editor.js
      if (editorInstance.current) {
        const outputData = await editorInstance.current.save();
        // Convert to JSON string for storage
        data.content = JSON.stringify(outputData);
      } else {
        // If no editor instance, set empty content
        data.content = JSON.stringify({ blocks: [] });
      }
      
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to save editor content:', error);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    setValue('tags', tagsArray);
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      try {
        setImageUploading(true);
        const file = e.target.files[0];
        const response = await uploadBlogImage(file);
        // Backend returns path like /uploads/blogs/... - save it as is
        // BlogCard will convert it to /api/uploads/blogs/... when displaying
        setValue('featuredImage', response.data.url);
      } catch (error) {
        console.error('Featured image upload failed:', error);
        alert('Failed to upload featured image. Please try again.');
      } finally {
        setImageUploading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Section 1: Basic Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-blue-600" />
          Basic Information
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: true })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-gray-900"
              placeholder="Enter blog title"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-900 mb-2">
              Excerpt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="excerpt"
              rows={3}
              {...register('excerpt', { required: true })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-gray-900"
              placeholder="Brief summary of the blog post"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FontAwesomeIcon icon={faEdit} className="mr-2 text-blue-600" />
          Content
        </h2>
        <div className="border-2 border-gray-200 rounded-lg bg-white min-h-[400px] p-4">
          <ReactEditorJS
            holder="editorjs-container"
            onInitialize={(instance) => {
              // #region agent log
              const holderEl = document.getElementById('editorjs-container');
              const holderStyles = holderEl ? window.getComputedStyle(holderEl) : null;
              const actualEditor = instance?._editorJS;
              const isReady = typeof actualEditor?.isReady === 'function' ? actualEditor.isReady() : undefined;
              fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:316',message:'onInitialize callback fired',data:{hasInstance:!!instance,hasActualEditor:!!actualEditor,isReady:isReady,hasHolderEl:!!holderEl,holderDisplay:holderStyles?.display,holderHeight:holderStyles?.height,holderWidth:holderStyles?.width,holderPosition:holderStyles?.position,instanceMethods:instance?Object.keys(instance):[],hasSave:typeof instance?.save==='function',hasRender:typeof instance?.render==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              editorInstance.current = instance;
              // #region agent log
              setTimeout(() => {
                const container = document.getElementById('editorjs-container');
                const editorEl = container?.querySelector('.codex-editor');
                const blocks = container?.querySelectorAll('.ce-block');
                const paragraph = container?.querySelector('.ce-paragraph');
                const toolbar = container?.querySelector('.ce-toolbar');
                const overlay = container?.querySelector('.codex-editor-overlay');
                const containerStyles = container ? window.getComputedStyle(container) : null;
                const editorStyles = editorEl ? window.getComputedStyle(editorEl) : null;
                const overlayStyles = overlay ? window.getComputedStyle(overlay) : null;
                const actualEditor = instance?._editorJS;
                const isReady = typeof actualEditor?.isReady === 'function' ? actualEditor.isReady() : undefined;
                fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:321',message:'DOM inspection after init',data:{hasEditorInstance:!!editorInstance.current,hasActualEditor:!!actualEditor,isReady:isReady,hasContainer:!!container,hasEditorEl:!!editorEl,hasOverlay:!!overlay,blockCount:blocks?.length||0,hasParagraph:!!paragraph,hasToolbar:!!toolbar,containerPointerEvents:containerStyles?.pointerEvents,containerZIndex:containerStyles?.zIndex,editorPointerEvents:editorStyles?.pointerEvents,editorZIndex:editorStyles?.zIndex,editorDisplay:editorStyles?.display,overlayPointerEvents:overlayStyles?.pointerEvents,overlayZIndex:overlayStyles?.zIndex,overlayDisplay:overlayStyles?.display},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
              }, 500);
              // #endregion
              // #region agent log
              setTimeout(() => {
                const container = document.getElementById('editorjs-container');
                if (container) {
                  container.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const editorEl = container.querySelector('.codex-editor');
                    const paragraph = container.querySelector('.ce-paragraph');
                    fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:335',message:'Container click event',data:{targetTag:target?.tagName,targetClass:target?.className,isEditorEl:target?.closest('.codex-editor')!==null,isParagraph:target?.closest('.ce-paragraph')!==null,hasEditorEl:!!editorEl,hasParagraph:!!paragraph,clientX:e.clientX,clientY:e.clientY},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
                  }, { once: false, passive: true });
                }
              }, 1000);
              // #endregion
              // #region agent log
              setTimeout(() => {
                const actualEditor = instance?._editorJS;
                const isReadyCheck = typeof actualEditor?.isReady === 'function' ? actualEditor.isReady() : undefined;
                if (actualEditor && isReadyCheck === false) {
                  fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:345',message:'Editor not ready, attempting to render',data:{hasActualEditor:!!actualEditor,isReady:isReadyCheck},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
                  try {
                    if (typeof instance?.render === 'function') {
                      instance.render();
                    }
                  } catch (err) {
                    fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:352',message:'Render error',data:{error:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
                  }
                }
              }, 1500);
              // #endregion
              // #region agent log
              // Remove overlay that blocks interactions - immediate and continuous
              const removeOverlay = () => {
                const container = document.getElementById('editorjs-container');
                const overlay = container?.querySelector('.codex-editor-overlay');
                if (overlay) {
                  fetch('http://127.0.0.1:7243/ingest/5ca117e3-0300-4edc-838c-ede556e42719',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogEditor.tsx:370',message:'Removing blocking overlay',data:{hasOverlay:!!overlay,overlayDisplay:window.getComputedStyle(overlay).display},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
                  (overlay as HTMLElement).style.display = 'none';
                  (overlay as HTMLElement).style.pointerEvents = 'none';
                  (overlay as HTMLElement).remove();
                }
              };
              // Try immediately
              removeOverlay();
              // Try after delays
              setTimeout(removeOverlay, 500);
              setTimeout(removeOverlay, 1000);
              setTimeout(removeOverlay, 2000);
              // Watch for overlay creation
              const container = document.getElementById('editorjs-container');
              if (container) {
                const observer = new MutationObserver(() => {
                  removeOverlay();
                });
                observer.observe(container, { childList: true, subtree: true });
                // Cleanup after 10 seconds
                setTimeout(() => observer.disconnect(), 10000);
              }
              // #endregion
            }}
            tools={tools}
            defaultValue={initialContent}
          />
          <div id="editorjs-container" style={{ minHeight: '400px', height: '400px', display: 'block' }}>&nbsp;</div>
        </div>
      </div>

      {/* Section 3: Media & Metadata */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FontAwesomeIcon icon={faCloudUpload} className="mr-2 text-blue-600" />
          Media & Metadata
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Featured Image
            </label>
            {/* Hidden input to ensure featuredImage is included in form submission */}
            <input
              type="hidden"
              {...register('featuredImage')}
            />
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                id="featuredImage"
                onChange={handleFeaturedImageUpload}
                className="hidden"
              />
              <label
                htmlFor="featuredImage"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {imageUploading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faImage} className="mr-2" />
                    Upload Image
                  </>
                )}
              </label>
              {featuredImage && (
                <div className="h-16 w-16 overflow-hidden rounded-lg border-2 border-gray-200">
                  <img
                    src={getImageUrl(featuredImage)}
                    alt="Featured"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-semibold text-gray-900 mb-2">
              <FontAwesomeIcon icon={faTags} className="mr-1" />
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tagsString}
              onChange={handleTagsChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-gray-900"
              placeholder="health, medicine, education"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Publishing Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FontAwesomeIcon icon={faCog} className="mr-2 text-blue-600" />
          Publishing Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-2">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-gray-900"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label htmlFor="readTime" className="block text-sm font-semibold text-gray-900 mb-2">
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              Read Time (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              id="readTime"
              type="number"
              min="1"
              {...register('readTime', { 
                required: true,
                valueAsNumber: true 
              })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting || imageUploading}
          className="inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Blog Post'
          )}
        </button>
      </div>
    </form>
  );
};

export default BlogEditor;
