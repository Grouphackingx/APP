'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerHost } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import Link from 'next/link';
import '../login/auth.css'; // Make sure auth styles are applied

export default function RegisterHostPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', // alias for firstName internally
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    identificationNumber: '',
    phone: '',
    organizationName: '',
    organizationDescription: '',
    plan: 'FREE' 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectPlan = (plan: string) => {
    setFormData(prev => ({ ...prev, plan }));
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`
      };
      
      const result = await registerHost(payload);
      loginUser(result.access_token, result.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al registrar organización.');
      setStep(1); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in-up" style={{ maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.5rem' }}>🚀</div>
        <h1>Únete como Organizador</h1>
        <p className="auth-subtitle">Crea, administra y vende tickets para tus eventos masivos</p>

        {/* Stepper Simple */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map(i => (
             <div key={i} style={{ height: '8px', borderRadius: '4px', flex: 1, backgroundColor: step >= i ? 'var(--color-primary)' : 'var(--border-color)' }} />
          ))}
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
          
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>1. Datos del Representante</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>
              
              <div className="form-group">
                <label>Identificación (DNI/RUC)</label>
                <input required name="identificationNumber" value={formData.identificationNumber} onChange={handleChange} />
              </div>
              
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              
              <div className="form-group">
                <label>Contraseña Segura</label>
                <input required type="password" name="password" minLength={6} value={formData.password} onChange={handleChange} />
              </div>

              <button 
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.firstName || !formData.lastName || !formData.email || formData.password.length < 6}
                className="btn btn-primary btn-lg btn-full"
                style={{ marginTop: '1rem' }}
              >
                Continuar a Detalles de Empresa →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>2. Perfil de la Organización</h3>
              
              <div className="form-group">
                <label>Nombre de la Productora / Organización</label>
                <input required name="organizationName" value={formData.organizationName} onChange={handleChange} placeholder="Ej. Massive Events Corp" />
              </div>
              
              <div className="form-group">
                <label>Teléfono de Soporte Comercial</label>
                <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="+593 999 999 999" />
              </div>

              <div className="form-group">
                <label>Acerca de la Organización (Opcional)</label>
                <textarea name="organizationDescription" rows={3} value={formData.organizationDescription} onChange={handleChange} placeholder="Breve historia o rubro..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>← Atrás</button>
                <button 
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.organizationName || !formData.phone}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  Elegir Plan →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>3. Elige tu Plan</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                
                <div onClick={() => handleSelectPlan('FREE')} style={{ padding: '1.5rem', border: `2px solid ${formData.plan === 'FREE' ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: formData.plan === 'FREE' ? 'var(--bg-glass-light)' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Plan Gratuito 🧊</h4>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>$0</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Crea y gestiona hasta 3 eventos simultáneos.</p>
                </div>

                <div onClick={() => handleSelectPlan('PLUS')} style={{ padding: '1.5rem', border: `2px solid ${formData.plan === 'PLUS' ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: formData.plan === 'PLUS' ? 'var(--bg-glass-light)' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Plan Plus ⭐</h4>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>$49 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/año</span></span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Hasta 12 eventos premium.</p>
                </div>

                <div onClick={() => handleSelectPlan('ELITE')} style={{ padding: '1.5rem', border: `2px solid ${formData.plan === 'ELITE' ? '#a855f7' : 'var(--border-color)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: formData.plan === 'ELITE' ? 'rgba(168, 85, 247, 0.1)' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a855f7' }}>Plan Elite 💎</h4>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>$99 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/año</span></span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Eventos ilimitados.</p>
                </div>

              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>← Atrás</button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {loading ? 'Creando cuenta...' : 'Finalizar Registro 🚀'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}
