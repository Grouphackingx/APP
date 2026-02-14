'use client';

import { useState } from 'react';
import { createEvent, uploadImage } from '../lib/api';

interface ZoneInput {
  name: string;
  price: number;
  capacity: number;
}

interface CreateEventFormProps {
  token: string;
  onSuccess: () => void;
}

export function CreateEventForm({ token, onSuccess }: CreateEventFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [zones, setZones] = useState<ZoneInput[]>([
    { name: 'General', price: 25, capacity: 50 },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'error' | 'success';
  } | null>(null);

  const addZone = () => {
    setZones([...zones, { name: '', price: 0, capacity: 10 }]);
  };

  const removeZone = (index: number) => {
    if (zones.length <= 1) return;
    setZones(zones.filter((_, i) => i !== index));
  };

  const updateZone = (
    index: number,
    field: keyof ZoneInput,
    value: string | number,
  ) => {
    const updated = [...zones];
    if (field === 'name') {
      updated[index][field] = value as string;
    } else {
      updated[index][field] = Number(value);
    }
    setZones(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'La imagen no debe superar 5MB', type: 'error' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile, token);
        } catch (uploadError: any) {
          throw new Error(`Error subiendo imagen: ${uploadError.message}`);
        }
      }

      const eventData = {
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        status: 'PUBLISHED',
        imageUrl, // URL returned from backend
        zones: zones.map((z) => ({
          name: z.name,
          price: z.price,
          capacity: z.capacity,
        })),
      };

      await createEvent(eventData, token);
      setMessage({ text: '🎉 ¡Evento creado exitosamente!', type: 'success' });
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      setMessage({
        text: err.message || 'Error al crear evento',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card animate-fade-in-up">
      {message && (
        <div
          className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}
        >
          {message.type === 'error' ? '⚠️ ' : ''}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Nombre del Evento *</label>
          <input
            id="title"
            type="text"
            placeholder="Ej: Concierto de Jazz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Imagen del Evento</label>
          <div className="image-upload-container">
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              hidden
            />
            <label htmlFor="imageUpload" className="file-label">
              {imagePreview ? (
                <div
                  className="image-preview"
                  style={{ backgroundImage: `url(${imagePreview})` }}
                >
                  <div className="image-overlay">Cambiar Imagen</div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span>📸 Cargar Imagen</span>
                  <small>(Max 5MB)</small>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            placeholder="Describe tu evento..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Fecha y Hora *</label>
            <input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Ubicación *</label>
            <input
              id="location"
              type="text"
              placeholder="Ej: Teatro Nacional"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Zones */}
        <div className="form-section">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3>🏟️ Zonas de Asientos</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addZone}
            >
              + Agregar Zona
            </button>
          </div>

          {zones.map((zone, i) => (
            <div key={i} className="zone-form-item">
              <div className="zone-header">
                <h4>Zona {i + 1}</h4>
                {zones.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeZone(i)}
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: VIP, General"
                    value={zone.name}
                    onChange={(e) => updateZone(i, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-row" style={{ gap: '0.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Precio ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={zone.price}
                      onChange={(e) => updateZone(i, 'price', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Capacidad</label>
                    <input
                      type="number"
                      min="1"
                      value={zone.capacity}
                      onChange={(e) =>
                        updateZone(i, 'capacity', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg btn-full"
          disabled={loading}
          style={{ marginTop: '1.5rem' }}
        >
          {loading ? '⏳ Subiendo...' : '🚀 Crear Evento'}
        </button>
      </form>
    </div>
  );
}
