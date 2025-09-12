import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/EncuestaSatisfaccion.module.css';

const EncuestaSatisfaccion = () => {
  const [calificacion, setCalificacion] = useState("");
  const [comentario, setComentario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [yaRespondida, setYaRespondida] = useState(false);
  
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const nombre = localStorage.getItem("nombre");
  const userRole = localStorage.getItem("rol");

  // Verificar si ya existe encuesta y obtener info del ticket
  useEffect(() => {
    const verifySurveyAndTicket = async () => {
      try {
        // Verificar si ya existe encuesta
        const encuestaResponse = await axios.get(
          `http://localhost:5000/usuarios/encuestas/${surveyId}/verificar`
        );
        
        if (encuestaResponse.data.existe_encuesta) {
          setYaRespondida(true);
          setError("Ya has completado la encuesta para este ticket");
          setTimeout(() => {
            navigate("/Tickets");
          }, 3000);
          return;
        }

        // Obtener información del ticket
        const ticketResponse = await axios.get(
          `http://localhost:5000/usuarios/tickets/${surveyId}`
        );
        
        if (ticketResponse.data.estado !== 'resuelto') {
          setError("Solo puedes completar encuestas para tickets resueltos");
          setTimeout(() => {
            navigate("/Tickets");
          }, 3000);
          return;
        }

        setTicketInfo(ticketResponse.data);

      } catch (err) {
        console.error("Error verificando encuesta:", err);
        if (err.response?.status === 404) {
          setError("Ticket no encontrado");
        } else {
          setError("Error al cargar la encuesta");
        }
        setTimeout(() => {
          navigate("/Tickets");
        }, 3000);
      }
    };
    
    verifySurveyAndTicket();
  }, [surveyId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!calificacion) {
      setError("Por favor seleccione una calificación");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5000/usuarios/api/encuestasatisfaccion`,
        {
          ticketId: parseInt(surveyId),
          calificacion: parseInt(calificacion),
          comentario,
          usuario: nombre || "Anónimo"
        }
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate("/Tickets");
        }, 3000);
      }
    } catch (err) {
      console.error("Error al enviar encuesta:", err);
      
      if (err.response?.status === 409) {
        setError("Ya has completado la encuesta para este ticket");
      } else if (err.response?.status === 400) {
        setError("El ticket no está resuelto o no existe");
      } else {
        setError(err.response?.data?.message || "Error al enviar la encuesta");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (yaRespondida) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Encuesta ya completada</h2>
          <p>Ya has respondido la encuesta para este ticket. Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (error && !ticketInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Error</h2>
          <p>{error}</p>
          <p>Redirigiendo a tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.encuestaCard}>
        <h1>📊 Encuesta de Satisfacción</h1>
        
        {ticketInfo && (
          <div className={styles.ticketInfo}>
            <h3>Ticket #{ticketInfo.id}: {ticketInfo.titulo}</h3>
            <p><strong>Descripción:</strong> {ticketInfo.descripcion}</p>
            <p><strong>Estado:</strong> <span className={styles.resuelto}>Resuelto</span></p>
          </div>
        )}

        {submitSuccess ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✅</div>
            <h2>¡Gracias por tu feedback!</h2>
            <p>Tu encuesta ha sido enviada correctamente.</p>
            <p>Redirigiendo a la página de tickets...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.encuestaForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                ¿Cómo calificaría el servicio recibido? *
              </label>
              <select 
                value={calificacion}
                onChange={(e) => setCalificacion(e.target.value)}
                required
                className={`${styles.formSelect} ${error && !calificacion ? styles.errorInput : ""}`}
              >
                <option value="">Seleccione una calificación...</option>
                <option value="5">⭐️⭐️⭐️⭐️⭐️ Excelente (5)</option>
                <option value="4">⭐️⭐️⭐️⭐️ Muy Bueno (4)</option>
                <option value="3">⭐️⭐️⭐️ Bueno (3)</option>
                <option value="2">⭐️⭐️ Regular (2)</option>
                <option value="1">⭐️ Deficiente (1)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Comentarios adicionales (opcional):
              </label>
              <textarea
                rows="4"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="¿Qué opinas del servicio recibido? ¿Alguna sugerencia para mejorar?"
                className={styles.formTextarea}
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <button 
                type="button" 
                onClick={() => navigate("/Tickets")}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Encuesta"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EncuestaSatisfaccion;
