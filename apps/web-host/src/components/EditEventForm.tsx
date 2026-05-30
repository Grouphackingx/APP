'use client';

import { useState, useEffect } from 'react';
import { updateEvent, uploadImage, getPaymentStatus } from '../lib/api';

interface ZoneInput {
  id?: string;
  name: string;
  description?: string;
  price: number | string;
  capacity: number | string;
  hasSold?: boolean;
  soldCount?: number;
  sellOnSite?: boolean;
}

interface EventData {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  province?: string;
  city?: string;
  mapUrl?: string;
  videoUrl?: string;
  status: string;
  category?: string;
  bannerImageUrl?: string;
  squareImageUrl?: string;
  galleryUrls?: string[];
  imageUrl?: string;
  seatingMapImageUrl?: string;
  hasSeatingChart?: boolean;
  zones?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    capacity: number;
    sellOnSite?: boolean;
    seats?: { isSold: boolean }[];
  }[];
}

interface EditEventFormProps {
  token: string;
  initialData: EventData;
  onSuccess: () => void;
}

const ecuadorData: Record<string, string[]> = {
  Azuay: ['Cuenca', 'Gualaceo', 'Paute'],
  Bolívar: ['Guaranda', 'Chillanes', 'San Miguel'],
  Cañar: ['Azogues', 'Biblián', 'La Troncal'],
  Carchi: ['Tulcán', 'Montúfar', 'Espejo'],
  Chimborazo: ['Riobamba', 'Guano', 'Colta'],
  Cotopaxi: ['Latacunga', 'La Maná', 'Salcedo'],
  'El Oro': ['Machala', 'Pasaje', 'Santa Rosa'],
  Esmeraldas: ['Esmeraldas', 'Quinindé', 'Atacames'],
  Galápagos: ['Puerto Baquerizo Moreno', 'Puerto Ayora'],
  Guayas: ['Guayaquil', 'Samborondón', 'Durán', 'Milagro', 'Daule'],
  Imbabura: ['Ibarra', 'Otavalo', 'Cotacachi'],
  Loja: ['Loja', 'Catamayo', 'Saraguro'],
  'Los Ríos': ['Babahoyo', 'Quevedo', 'Ventanas'],
  Manabí: ['Portoviejo', 'Manta', 'Chone', 'Bahía de Caráquez'],
  'Morona Santiago': ['Macas', 'Gualaquiza', 'Sucúa'],
  Napo: ['Tena', 'Archidona', 'El Chaco'],
  Orellana: ['Puerto Francisco de Orellana', 'La Joya de los Sachas'],
  Pastaza: ['Puyo', 'Mera', 'Santa Clara'],
  Pichincha: ['Quito', 'Cayambe', 'Rumiñahui'],
  'Santa Elena': ['Santa Elena', 'La Libertad', 'Salinas'],
  'Santo Domingo de los Tsáchilas': ['Santo Domingo'],
  Sucumbíos: ['Nueva Loja', 'Shushufindi'],
  Tungurahua: ['Ambato', 'Baños de Agua Santa', 'Pelileo'],
  'Zamora Chinchipe': ['Zamora', 'Yantzaza'],
};

export function EditEventForm({ token, initialData, onSuccess }: EditEventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [province, setProvince] = useState(initialData?.province || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [mapEmbedCode, setMapEmbedCode] = useState(initialData?.mapUrl || '');
  const [videoEmbedCode, setVideoEmbedCode] = useState(initialData?.videoUrl || '');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [category, setCategory] = useState(initialData?.category || 'Fiestas y Bailes');
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>(initialData?.galleryUrls || []);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>(initialData?.bannerImageUrl || '');
  const [squareImageFile, setSquareImageFile] = useState<File | null>(null);
  const [squareImagePreview, setSquareImagePreview] = useState<string>(initialData?.squareImageUrl || '');
  const [portraitImageFile, setPortraitImageFile] = useState<File | null>(null);
  const [portraitImagePreview, setPortraitImagePreview] = useState<string>((initialData as any)?.portraitImageUrl || '');
  const [loading, setLoading] = useState(false);
  const [paidEventsEnabled, setPaidEventsEnabled] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: 'error' | 'success';
  } | null>(null);

  const [zones, setZones] = useState<ZoneInput[]>(
    initialData?.zones?.map((z) => {
      const soldCount = z.seats?.filter((s) => s.isSold)?.length || 0;
      return {
        id: z.id,
        name: z.name,
        description: z.description || '',
        price: z.price,
        capacity: z.capacity,
        hasSold: soldCount > 0,
        soldCount,
        sellOnSite: z.sellOnSite ?? false,
      };
    }) || [{ name: 'General', description: '', price: 25, capacity: 50, hasSold: false, soldCount: 0 }]
  );
  const [seatingMapImageFile, setSeatingMapImageFile] = useState<File | null>(null);
  const [seatingMapImagePreview, setSeatingMapImagePreview] = useState<string>(initialData?.seatingMapImageUrl || '');
  const [hasSeatingChart, setHasSeatingChart] = useState(initialData?.hasSeatingChart ?? true);

  useEffect(() => {
    getPaymentStatus(token)
      .then(res => setPaidEventsEnabled(res.paidEventsEnabled))
      .catch(() => setPaidEventsEnabled(false));
  }, [token]);

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
    value: string | number | boolean,
  ) => {
    const updated = [...zones];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setZones(updated);
  };

  const handleSeatingMapImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > parseFloat(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5') * 1024 * 1024) {
        setMessage({
          text: `La imagen del croquis no debe superar ${process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'} MB`,
          type: 'error',
        });
        return;
      }
      setSeatingMapImageFile(file);
      setSeatingMapImagePreview(URL.createObjectURL(file));
      setMessage(null);
    }
  };


  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (files.length + galleryFiles.length + existingGalleryUrls.length > 3) {
        setMessage({ text: 'Máximo 3 imágenes en la galería', type: 'error' });
        return;
      }

      const newFiles = Array.from(files);
      const invalidSize = newFiles.some((f) => f.size > parseFloat(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5') * 1024 * 1024);
      if (invalidSize) {
        setMessage({
          text: `Alguna imagen supera los ${process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'} MB`,
          type: 'error',
        });
        return;
      }

      setGalleryFiles([...galleryFiles, ...newFiles]);
      setGalleryPreviews([
        ...galleryPreviews,
        ...newFiles.map((f) => URL.createObjectURL(f)),
      ]);
      setMessage(null);
    }
  };

  const removeGalleryImage = (index: number) => {
    if (index < existingGalleryUrls.length) {
      setExistingGalleryUrls(existingGalleryUrls.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingGalleryUrls.length;
      setGalleryFiles(galleryFiles.filter((_, i) => i !== fileIndex));
      setGalleryPreviews(galleryPreviews.filter((_, i) => i !== fileIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      // Validate capacity is not below sold count
      for (const z of zones) {
        const cap = Number(z.capacity);
        if (z.soldCount && cap < z.soldCount) {
          setMessage({
            text: `La zona "${z.name}" tiene ${z.soldCount} entradas vendidas. La capacidad no puede ser menor a ese número.`,
            type: 'error',
          });
          setLoading(false);
          return;
        }
      }

      let imageUrl = '';



      let bannerImageUrl = initialData?.bannerImageUrl || '';
      if (bannerImageFile) {
        try {
          bannerImageUrl = await uploadImage(bannerImageFile, token);
        } catch (uploadError: unknown) {
          throw new Error(`Error subiendo banner: ${(uploadError as Error).message}`);
        }
      }

      let squareImageUrl = initialData?.squareImageUrl || '';
      if (squareImageFile) {
        try {
          squareImageUrl = await uploadImage(squareImageFile, token);
        } catch (uploadError: unknown) {
          throw new Error(`Error subiendo imagen cuadrada: ${(uploadError as Error).message}`);
        }
      }

      let portraitImageUrl = (initialData as any)?.portraitImageUrl || '';
      if (portraitImageFile) {
        try {
          portraitImageUrl = await uploadImage(portraitImageFile, token);
        } catch (uploadError: unknown) {
          throw new Error(`Error subiendo imagen retrato: ${(uploadError as Error).message}`);
        }
      }

      let seatingMapImageUrl = initialData?.seatingMapImageUrl || '';

      if (seatingMapImageFile) {
        try {
          seatingMapImageUrl = await uploadImage(seatingMapImageFile, token);
        } catch (uploadError: unknown) {
          throw new Error(`Error subiendo croquis: ${(uploadError as Error).message}`);
        }
      }

      const galleryUrls = [];
      if (galleryFiles.length > 0) {
        try {
          for (const file of galleryFiles) {
            const url = await uploadImage(file, token);
            galleryUrls.push(url);
          }
        } catch (uploadError: unknown) {
          throw new Error(`Error subiendo galería: ${(uploadError as Error).message}`);
        }
      }

      const eventData = {
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        province,
        city,
        mapUrl: mapEmbedCode.match(/src="([^"]+)"/)?.[1] || mapEmbedCode,
        videoUrl: videoEmbedCode.match(/src="([^"]+)"/)?.[1] || videoEmbedCode,
        galleryUrls: [...existingGalleryUrls, ...galleryUrls],
        status: status,
        category,
        imageUrl: imageUrl || initialData?.imageUrl || '',
        bannerImageUrl,
        squareImageUrl,
        portraitImageUrl,
        seatingMapImageUrl,
        hasSeatingChart,
        zones: zones.map((z: ZoneInput) => ({
          id: z.id,
          name: z.name,
          description: z.description,
          price: (z.sellOnSite || paidEventsEnabled === false) ? 0 : Number(z.price),
          capacity: (z.sellOnSite || paidEventsEnabled === false) ? 0 : Number(z.capacity),
          sellOnSite: z.sellOnSite ?? false,
        })),
      };

      await updateEvent(initialData.id, eventData, token);
      setMessage({ text: '🎉 ¡Evento guardado exitosamente!', type: 'success' });
      setTimeout(() => onSuccess(), 1500);
    } catch (err: unknown) {
      setMessage({
        text: (err as Error).message || 'Error al crear evento',
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

      {paidEventsEnabled === false && (
        <div style={{
          padding: '0.85rem 1.2rem', borderRadius: '10px', marginBottom: '1.25rem',
          background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.3)',
          color: '#fb923c', fontSize: '0.875rem', lineHeight: 1.5,
        }}>
          <strong>Pasarela de pagos no disponible.</strong> Los precios son forzados a $0. Solo se permiten zonas gratuitas o con venta en el lugar.
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
          <label>Banner Panorámico (Recomendado: 2000x576 — Relación 126:36)</label>
          <div className="image-upload-container">
            <input
              type="file"
              id="bannerUpload"
              accept={process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > parseFloat(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5') * 1024 * 1024) { setMessage({ text: `La imagen no debe superar ${process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'} MB.`, type: 'error' }); e.target.value = ''; return; }
                  setBannerImageFile(file);
                  setBannerImagePreview(URL.createObjectURL(file));
                }
              }}
              className="file-input"
              hidden
            />
            <label htmlFor="bannerUpload" className="file-label file-label--banner">
              {bannerImagePreview ? (
                <div
                  className="image-preview"
                  style={{ backgroundImage: `url(${bannerImagePreview})` }}
                >
                  <div className="image-overlay">Cambiar Banner</div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span>🖼️ Cargar Banner</span>
                  <small>(Max {process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'}MB)</small>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="image-upload-pair">
          <div className="form-group">
            <label>Imagen Cuadrada (Relación 1:1)</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="squareUpload"
                accept={process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > parseFloat(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5') * 1024 * 1024) { setMessage({ text: `La imagen no debe superar ${process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'} MB.`, type: 'error' }); e.target.value = ''; return; }
                    setSquareImageFile(file);
                    setSquareImagePreview(URL.createObjectURL(file));
                  }
                }}
                className="file-input"
                hidden
              />
              <label htmlFor="squareUpload" className="file-label file-label--square">
                {squareImagePreview ? (
                  <div
                    className="image-preview"
                    style={{ backgroundImage: `url(${squareImagePreview})` }}
                  >
                    <div className="image-overlay">Cambiar Imagen</div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span>🖼️ Cargar Imagen</span>
                    <small>(Max {process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'}MB)</small>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Imagen Retrato (Relación 3:4)</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="portraitUpload"
                accept={process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > parseFloat(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5') * 1024 * 1024) { setMessage({ text: `La imagen no debe superar ${process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'} MB.`, type: 'error' }); e.target.value = ''; return; }
                    setPortraitImageFile(file);
                    setPortraitImagePreview(URL.createObjectURL(file));
                  }
                }}
                className="file-input"
                hidden
              />
              <label htmlFor="portraitUpload" className="file-label file-label--portrait">
                {portraitImagePreview ? (
                  <div
                    className="image-preview"
                    style={{ backgroundImage: `url(${portraitImagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    <div className="image-overlay">Cambiar Imagen</div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span>🖼️ Cargar Imagen 3:4</span>
                    <small>(Recomendado: 1200×1600px — Max {process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5'}MB)</small>
                  </div>
                )}
              </label>
            </div>
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

        <div className="form-group">
          <label htmlFor="category">Categoría del Evento *</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            <option value="Fiestas y Bailes">Fiestas y Bailes</option>
            <option value="Conciertos">Conciertos</option>
            <option value="Festivales musicales">Festivales musicales</option>
            <option value="Discotecas">Discotecas</option>
            <option value="DJ Sessions">DJ Sessions</option>
            <option value="Eventos Culturales">Eventos Culturales</option>
            <option value="Eventos Comunitarios">Eventos Comunitarios</option>
            <option value="Deportes">Deportes</option>
            <option value="Gastronomía">Gastronomía</option>
            <option value="Emprendimientos">Emprendimientos</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Fecha y Hora *</label>
            <input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="province">Provincia *</label>
            <select
              id="province"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setCity('');
              }}
              required
            >
              <option value="">Selecciona una provincia</option>
              {Object.keys(ecuadorData).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="city">Ciudad *</label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={!province}
            >
              <option value="">Selecciona una ciudad</option>
              {province &&
                ecuadorData[province as keyof typeof ecuadorData].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Dirección / Lugar *</label>
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

        <div className="form-group">
          <label htmlFor="mapEmbedCode">
            Mapa de Google Maps (Embed Code o URL)
          </label>
          <input
            id="mapEmbedCode"
            type="text"
            placeholder='Pega aquí el código <iframe src="..."> o la URL del mapa embebido'
            value={mapEmbedCode}
            onChange={(e) => setMapEmbedCode(e.target.value)}
          />
          <small className="form-text text-muted">
            Ve a Google Maps → Compartir → Insertar un mapa → Copiar HTML.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="videoEmbedCode">
            Video (Embed Code o URL) - Opcional
          </label>
          <input
            id="videoEmbedCode"
            type="text"
            placeholder='Pega aquí el código <iframe src="...">, URL de YouTube, etc.'
            value={videoEmbedCode}
            onChange={(e) => setVideoEmbedCode(e.target.value)}
          />
          <small className="form-text text-muted">
            Soporta enlaces de YouTube, Vimeo, Facebook, etc.
          </small>
        </div>

        <div className="form-group">
          <label>Galería de Imágenes (Opcional - Max 3)</label>
          <div
            className="gallery-upload-container"
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            {[...existingGalleryUrls, ...galleryPreviews].map((preview, i) => (
              <div
                key={i}
                className="gallery-preview-item"
                style={{ position: 'relative', width: 100, height: 100 }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${preview})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    background: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  X
                </button>
              </div>
            ))}
            {existingGalleryUrls.length + galleryFiles.length < 3 && (
              <>
                <input
                  type="file"
                  id="galleryUpload"
                  accept={process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp'}
                  multiple
                  onChange={handleGalleryChange}
                  className="file-input"
                  hidden
                />
                <label
                  htmlFor="galleryUpload"
                  className="file-label"
                  style={{
                    width: 100,
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <span
                    style={{ fontSize: '2rem', color: 'var(--text-muted)' }}
                  >
                    +
                  </span>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Zones */}
        <div className="form-section" style={{ marginTop: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Tipo de Localidad</label>
            <div
              className="eventType-toggle"
              style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}
            >
              <button
                type="button"
                className={`btn ${!hasSeatingChart ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setHasSeatingChart(false)}
              >
                🎫 Entradas
              </button>
              <button
                type="button"
                className={`btn ${hasSeatingChart ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setHasSeatingChart(true)}
              >
                🪑 Asientos Numerados
              </button>
            </div>
            <p
              className="form-text text-muted"
              style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}
            >
              {hasSeatingChart
                ? 'Los usuarios seleccionarán sus asientos específicos desde un mapa interactivo.'
                : 'Los usuarios solo seleccionarán la cantidad de entradas para cada zona/área.'}
            </p>
          </div>

          {hasSeatingChart && (
            <div className="form-group">
              <label>Croquis de Localidades (Opcional)</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="seatingMapUpload"
                  accept={process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp'}
                  onChange={handleSeatingMapImageChange}
                  className="file-input"
                  hidden
                />
                <label htmlFor="seatingMapUpload" className="file-label">
                  {seatingMapImagePreview ? (
                    <div
                      className="image-preview"
                      style={{
                        backgroundImage: `url(${seatingMapImagePreview})`,
                      }}
                    >
                      <div className="image-overlay">Cambiar Croquis</div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span>🗺️ Cargar Croquis</span>
                      <small>(Max 1MB)</small>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

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
                {zones.length > 1 && !zone.hasSold && (
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
                    disabled={zone.hasSold}
                    title={zone.hasSold ? 'No se puede modificar (boletos vendidos)' : ''}
                  />
                  {zone.hasSold && <small style={{color:'red'}}>Bloqueado (ventas activas)</small>}
                </div>
                <div
                  className="form-group"
                  style={{ marginBottom: 0, flex: 2 }}
                >
                  <label>Descripción (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Incluye una bebida, cerca del escenario..."
                    value={zone.description || ''}
                    onChange={(e) =>
                      updateZone(i, 'description', e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="zone-sell-onsite" style={{ marginTop: '0.75rem' }}>
                <label className="zone-sell-onsite-label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: zone.hasSold ? 'not-allowed' : 'pointer', userSelect: 'none', opacity: zone.hasSold ? 0.5 : 1 }}>
                  <input
                    type="checkbox"
                    checked={zone.sellOnSite ?? false}
                    onChange={(e) => updateZone(i, 'sellOnSite', e.target.checked)}
                    disabled={zone.hasSold}
                    style={{ width: '1rem', height: '1rem', accentColor: 'var(--color-primary)', cursor: zone.hasSold ? 'not-allowed' : 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    Entradas disponibles en el lugar y día del evento
                  </span>
                </label>
                {zone.sellOnSite && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.35rem', marginLeft: '1.6rem' }}>
                    El precio y la capacidad no aplican para esta zona.
                  </p>
                )}
              </div>

              {!zone.sellOnSite && (
              <div
                className="form-row"
                style={{ gap: '0.5rem', marginTop: '1rem' }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Precio ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidEventsEnabled === false ? 0 : zone.price}
                    onChange={(e) => { if (!zone.hasSold && paidEventsEnabled !== false) updateZone(i, 'price', e.target.value); }}
                    required
                    disabled={zone.hasSold || paidEventsEnabled === false}
                    title={zone.hasSold ? 'No se puede modificar (boletos vendidos)' : paidEventsEnabled === false ? 'Pasarela de pagos deshabilitada — precio bloqueado en $0' : ''}
                    style={(zone.hasSold || paidEventsEnabled === false) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Capacidad</label>
                  <input
                    type="number"
                    min={zone.soldCount && zone.soldCount > 0 ? zone.soldCount : 1}
                    value={paidEventsEnabled === false ? 0 : zone.capacity}
                    onChange={(e) => { if (paidEventsEnabled !== false) updateZone(i, 'capacity', e.target.value); }}
                    required
                    disabled={paidEventsEnabled === false}
                    title={paidEventsEnabled === false ? 'Pasarela de pagos deshabilitada — capacidad bloqueada en 0' : ''}
                    style={paidEventsEnabled === false ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  />
                  {zone.soldCount != null && zone.soldCount > 0 && (
                    <small style={{ color: '#f59e0b' }}>
                      Mínimo: {zone.soldCount} (vendidos)
                    </small>
                  )}
                </div>
              </div>
              )}
            </div>
          ))}
        </div>

        <div className="form-section" style={{ marginTop: '2rem' }}>
          <div className="form-group">
            <label htmlFor="status" style={{ fontSize: '1.2rem', color: '#22D3EE' }}>Estado del Evento *</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1.1rem' }}
            >
              <option value="DRAFT">📝 Borrador (No publicado en inicio)</option>
              <option value="PUBLISHED">🟢 Activo (Publicado al inicio)</option>
            </select>
            <p className="form-text text-muted" style={{ marginTop: '0.5rem' }}>
              Determina si el evento ya puede ser visto por los compradores o si aún está en preparación.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg btn-full"
          disabled={loading}
          style={{ marginTop: '1.5rem' }}
        >
          {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
