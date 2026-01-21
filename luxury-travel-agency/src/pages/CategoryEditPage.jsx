import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import RichTextEditor from '../components/common/RichTextEditor';
import { initDatabase, getCategories, updateCategory, deleteCategory } from '../services/jsonDatabase';

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 2rem;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #6A1B82;
    box-shadow: 0 0 0 3px rgba(106, 27, 130, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.$variant === 'outline' ? '#fff' : '#6A1B82')};
  color: ${(p) => (p.$variant === 'outline' ? '#111827' : '#fff')};
  border: ${(p) => (p.$variant === 'outline' ? '1px solid #d1d5db' : 'none')};
  box-shadow: ${(p) =>
    p.$variant === 'outline' ? 'none' : '0 10px 20px rgba(106,27,130,0.25)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(p) =>
      p.$variant === 'outline' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 12px 24px rgba(106,27,130,0.3)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMsg = styled.div`
  color: #b91c1c;
  font-weight: 600;
  padding: 1rem;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fca5a5;
`;

const SuccessMsg = styled.div`
  color: #065f46;
  font-weight: 600;
  padding: 1rem;
  background: #d1fae5;
  border-radius: 8px;
  border: 1px solid #6ee7b7;
`;

const CategoryEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    highlights: '',
    image: null,
    contentImage: null,
  });

  useEffect(() => {
    const loadCategory = async () => {
      try {
        // Initialize database first
        await initDatabase();
        
        // Add a small delay to ensure database is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const categories = await getCategories();
        setAllCategories(categories);
        console.log('All categories:', categories);
        console.log('Looking for ID:', id, 'Type:', typeof id);
        
        // ID can be either a number or string, try both
        const found = categories.find(c => 
          c.id === id || 
          c.id === parseInt(id) || 
          c.id?.toString() === id?.toString()
        );
        console.log('Found category:', found);
        
        if (!found) {
          console.error('Category not found. Available IDs:', categories.map(c => ({ id: c.id, name: c.name, type: typeof c.id })));
          setError('Category not found. Please go back to admin and try again.');
          setLoading(false);
          return;
        }
        
        setCategory(found);
        setForm({
          name: found.name || '',
          description: found.description || '',
          highlights: found.highlights || '',
          image: null,
          contentImage: null,
          parent_id: found.parent_id || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Error loading category:', err);
        setError('Failed to load category: ' + err.message);
        setLoading(false);
      }
    };
    
    loadCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    console.log('🚀 Submitting category update:', {
      slug: category.slug,
      name: form.name,
      hasImageFile: !!form.image,
      imageFileName: form.image?.name,
      hasContentImageFile: !!form.contentImage,
      contentImageFileName: form.contentImage?.name
    });
    
    try {
      await updateCategory(category.slug, {
        name: form.name,
        description: form.description,
        highlights: form.highlights,
        imageFile: form.image,
        contentImageFile: form.contentImage,
        parent_id: form.parent_id || null,
      });
      
      setSuccess('Category updated successfully!');
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const categoryType = category.parent_id ? 'subcategory' : 'category';
    const confirmMsg = `Delete this ${categoryType} "${category.name}"?${!category.parent_id ? ' This will also delete all its subcategories.' : ''}`;
    
    if (!window.confirm(confirmMsg)) return;
    
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      await deleteCategory(category.slug);
      setSuccess(`${categoryType.charAt(0).toUpperCase() + categoryType.slice(1)} deleted successfully!`);
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete: ' + err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <p>Loading...</p>
      </Page>
    );
  }

  if (!category) {
    return (
      <Page>
        <ErrorMsg>Category not found</ErrorMsg>
        <BackButton onClick={() => navigate('/admin')}>Back to Admin</BackButton>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <Title>Edit {category.parent_id ? 'Subcategory' : 'Category'}: {category.name}</Title>
        <BackButton onClick={() => navigate('/admin')}>← Back to Admin</BackButton>
      </Header>

      <Card>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        {success && <SuccessMsg>{success}</SuccessMsg>}
        
        <Form onSubmit={handleSubmit}>
          <Field>
            <Label>Name</Label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>

          <Field>
            <Label>Description (Rich Text)</Label>
            <RichTextEditor
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              placeholder="Add detailed description with formatting, images, lists, etc..."
            />
          </Field>

          <Field>
            <Label>Key Highlights (Rich Text)</Label>
            <RichTextEditor
              value={form.highlights}
              onChange={(value) => setForm({ ...form, highlights: value })}
              placeholder="Add key highlights like: Wide selection of luxury cars, Self-drive options, GPS available..."
            />
          </Field>

          {/* Parent Category Selection - Only show for subcategories */}
          {category?.parent_id && (
            <Field>
              <Label>Parent Category</Label>
              <select
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: '#fff'
                }}
              >
                <option value="">Select parent category</option>
                {allCategories
                  .filter(c => !c.parent_id) // Show main categories
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Main)
                    </option>
                  ))}
                {allCategories
                  .filter(c => c.parent_id && c.id !== category.id) // Show L1 subcategories (exclude self)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (L1)
                    </option>
                  ))}
              </select>
            </Field>
          )}

          <Field>
            <Label>Hero Image (Banner)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Displayed at the top of the service page as the main banner</small>
            {category.image && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current hero image:</p>
                <img
                  src={category.image}
                  alt={category.name}
                  style={{ width: '200px', height: 'auto', borderRadius: '8px', marginTop: '0.5rem' }}
                />
              </div>
            )}
          </Field>

          <Field>
            <Label>Content Image (Info Section)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, contentImage: e.target.files[0] })}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Displayed next to "Experience Luxury" section</small>
            {category.content_image && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current content image:</p>
                <img
                  src={category.content_image}
                  alt={`${category.name} content`}
                  style={{ width: '200px', height: 'auto', borderRadius: '8px', marginTop: '0.5rem' }}
                />
              </div>
            )}
          </Field>

          <ButtonGroup>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              $variant="outline"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              $variant="outline"
              onClick={handleDelete}
              disabled={saving}
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
            >
              Delete {category.parent_id ? 'Subcategory' : 'Category'}
            </Button>
          </ButtonGroup>
        </Form>
      </Card>
    </Page>
  );
};

export default CategoryEditPage;
