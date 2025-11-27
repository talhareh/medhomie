import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useForm } from 'react-hook-form';
import { BlogFormData, uploadBlogImage } from '../../services/blogService';
import { getImageUrl } from '../../utils/imageUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faImage, 
  faTags, 
  faClock,
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faListUl,
  faListOl,
  faQuoteLeft,
  faUndo,
  faRedo,
  faHeading,
  faLink,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify
} from '@fortawesome/free-solid-svg-icons';

interface BlogEditorProps {
  initialData?: Partial<BlogFormData>;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const [imageUploading, setImageUploading] = useState(false);
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
  const tagsString = watch('tags')?.join(', ') || '';

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: initialData?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setValue('content', html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Update editor content when initialData changes
  useEffect(() => {
    if (editor && initialData?.content && editor.isEmpty) {
      editor.commands.setContent(initialData.content);
    }
  }, [editor, initialData?.content]);

  // Image upload handler
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file && editor) {
        try {
          setImageUploading(true);
          const response = await uploadBlogImage(file);
          // Backend returns path like /uploads/blogs/... - convert to /api/uploads/blogs/... for display
          const imagePath = response.data.url.replace('uploads/', '/api/uploads/');
          
          editor.chain().focus().setImage({ src: imagePath }).run();
        } catch (error) {
          console.error('Image upload failed:', error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setImageUploading(false);
        }
      }
    };
  }, [editor]);

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

  if (!editor) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter blog title"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          rows={3}
          {...register('excerpt', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Brief summary of the blog post"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <div className="mt-1 border border-gray-300 rounded-md overflow-hidden bg-white">
          {/* Toolbar */}
          <div className="border-b border-gray-300 p-2 flex flex-wrap items-center gap-2 bg-gray-50">
            {/* Text Formatting */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Bold"
            >
              <FontAwesomeIcon icon={faBold} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Italic"
            >
              <FontAwesomeIcon icon={faItalic} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Underline"
            >
              <FontAwesomeIcon icon={faUnderline} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Strikethrough"
            >
              <FontAwesomeIcon icon={faStrikethrough} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Headings */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Heading 1"
            >
              <FontAwesomeIcon icon={faHeading} /> 1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Heading 2"
            >
              <FontAwesomeIcon icon={faHeading} /> 2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Heading 3"
            >
              <FontAwesomeIcon icon={faHeading} /> 3
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Lists */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Bullet List"
            >
              <FontAwesomeIcon icon={faListUl} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Numbered List"
            >
              <FontAwesomeIcon icon={faListOl} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Quote"
            >
              <FontAwesomeIcon icon={faQuoteLeft} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Alignment */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Align Left"
            >
              <FontAwesomeIcon icon={faAlignLeft} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Align Center"
            >
              <FontAwesomeIcon icon={faAlignCenter} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Align Right"
            >
              <FontAwesomeIcon icon={faAlignRight} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Justify"
            >
              <FontAwesomeIcon icon={faAlignJustify} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Links and Images */}
            <button
              type="button"
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('Enter URL:', previousUrl);
                if (url === null) {
                  return;
                }
                if (url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Insert Link"
            >
              <FontAwesomeIcon icon={faLink} />
            </button>
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={imageUploading}
              className="p-2 rounded hover:bg-gray-200"
              title="Insert Image"
            >
              {imageUploading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faImage} />
              )}
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Undo/Redo */}
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
              title="Undo"
            >
              <FontAwesomeIcon icon={faUndo} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
              title="Redo"
            >
              <FontAwesomeIcon icon={faRedo} />
            </button>
          </div>

          {/* Editor Content */}
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Featured Image
          </label>
          {/* Hidden input to ensure featuredImage is included in form submission */}
          <input
            type="hidden"
            {...register('featuredImage')}
          />
          <div className="mt-1 flex items-center">
            <input
              type="file"
              accept="image/*"
              id="featuredImage"
              onChange={handleFeaturedImageUpload}
              className="hidden"
            />
            <label
              htmlFor="featuredImage"
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {imageUploading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faImage} />
              )}{' '}
              Upload Image
            </label>
            {featuredImage && (
              <div className="ml-3 h-12 w-12 overflow-hidden rounded-md">
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
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            <FontAwesomeIcon icon={faTags} /> Tags (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tagsString}
            onChange={handleTagsChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="health, medicine, education"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div>
          <label htmlFor="readTime" className="block text-sm font-medium text-gray-700">
            <FontAwesomeIcon icon={faClock} /> Read Time (minutes)
          </label>
          <input
            id="readTime"
            type="number"
            min="1"
            {...register('readTime', { 
              required: true,
              valueAsNumber: true 
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || imageUploading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
