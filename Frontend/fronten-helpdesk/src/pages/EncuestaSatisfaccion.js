import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/EncuestaSatisfaccion.module.css';

const EncuestaSatisfaccion = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Aquí podrías cargar datos específicos de la encuesta usando surveyId
  }, [surveyId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar la encuesta
    
    // Redirigir a home después de completar
    navigate('/home');
  };

  return (
    <div className={styles.encuestaContainer}>
      <h1>Encuesta de Satisfacción</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>¿Cómo calificaría el servicio recibido?</label>
          <select required>
            <option value="">Seleccione...</option>
            <option value="5">Excelente (5)</option>
            <option value="4">Muy Bueno (4)</option>
            <option value="3">Bueno (3)</option>
            <option value="2">Regular (2)</option>
            <option value="1">Deficiente (1)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Comentarios adicionales</label>
          <textarea rows="4" placeholder="Escribe tus comentarios aquí..."></textarea>
        </div>

        <button type="submit" className={styles.submitButton}>
          Enviar Encuesta
        </button>
      </form>
    </div>
  );
};

export default EncuestaSatisfaccion;