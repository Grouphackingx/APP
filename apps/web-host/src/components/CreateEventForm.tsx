'use client';

import { useState } from 'react';
import { createEvent } from '../lib/api';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const eventData = {
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        status: 'PUBLISHED',
        zones: zones.map((z) => ({
          name: z.name,
          price: z.price,
          capacity: z.capacity,
        })),
      };

      await createEvent(eventData, token);
      setSuccess('🎉 ¡Evento creado exitosamente!');
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al crear evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card animate-fade-in-up">
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

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
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            placeholder="Describe tu evento..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          {loading ? '⏳ Creando...' : '🚀 Crear Evento'}
        </button>
      </form>
    </div>
  );
}
