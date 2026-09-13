import { useState, useEffect } from 'react'
import { getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../../services/adminApi.js'
import { fetchCategories } from '../../services/categoryApi.js'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
}

const EMPTY_FORM = { name: '', description: '', price: '', originalPrice: '', categoryId: '', brand: '', image: '', images: '', tags: '', specifications: '', stock: '', subcategory: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAdminProducts({ search }),
        fetchCategories(),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search])

  const openCreate = () => {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price != null ? String(product.price) : '',
      originalPrice: product.originalPrice != null ? String(product.originalPrice) : '',
      categoryId: product.categoryId || '',
      brand: product.brand || '',
      image: product.image || '',
      images: product.images ? JSON.stringify(product.images) : '',
      tags: product.tags ? JSON.stringify(product.tags) : '',
      specifications: product.specifications ? JSON.stringify(product.specifications) : '',
      stock: product.stock != null ? String(product.stock) : '',
      subcategory: product.subcategory || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        categoryId: form.categoryId,
        brand: form.brand || null,
        image: form.image || null,
        images: form.images ? JSON.parse(form.images) : null,
        tags: form.tags ? JSON.parse(form.tags) : null,
        specifications: form.specifications ? JSON.parse(form.specifications) : null,
        stock: Number(form.stock),
        subcategory: form.subcategory || null,
      }

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload)
      } else {
        await createAdminProduct(payload)
      }

      setShowForm(false)
      setEditingProduct(null)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      setError(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await deleteAdminProduct(id)
      load()
    } catch (err) {
      setError(err.message || 'Failed to delete product')
    }
  }

  const parseArray = (val) => {
    try { return JSON.parse(val) } catch { return val }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading products...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, maxWidth: 400 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}
          />
        </div>
        <button
          onClick={openCreate}
          style={{ padding: '10px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div style={{ background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 12, padding: 16, color: C.danger, fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.background }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Stock</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>{product.id}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: C.text }}>{product.name}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>{product.categoryName || product.categoryId}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: C.text }}>${Number(product.price).toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: product.stock <= 5 ? `${C.danger}15` : `${C.success}15`,
                      color: product.stock <= 5 ? C.danger : C.success,
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button onClick={() => openEdit(product)} style={{ padding: '6px 14px', background: C.primaryLight, color: C.primary, border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginRight: 8 }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)} style={{ padding: '6px 14px', background: `${C.danger}15`, color: C.danger, border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '0 0 20px' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Description *</label>
                  <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Price *</label>
                    <input required type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Original Price</label>
                    <input type="number" step="0.01" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Category *</label>
                    <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}>
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Stock *</label>
                    <input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Brand</label>
                  <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Image URL</label>
                  <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); setForm(EMPTY_FORM) }} style={{ padding: '10px 20px', background: C.background, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ padding: '10px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
