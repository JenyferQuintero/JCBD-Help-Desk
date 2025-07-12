import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Outlet } from 'react-router-dom';
import axios from 'axios';
import { FaMagnifyingGlass, FaPowerOff } from "react-icons/fa6";
import { FiAlignJustify } from "react-icons/fi";
import {
  FcHome,
  FcAssistant,
  FcBusinessman,
  FcAutomatic,
  FcAnswers,
  FcCustomerSupport,
  FcExpired,
  FcGenealogy,
  FcBullish,
  FcConferenceCall,
  FcPortraitMode,
  FcOrganization,
} from "react-icons/fc";
import { FaRegClock, FaCheckCircle, FaHistory } from "react-icons/fa";
import styles from '../styles/EncuestaSatisfaccion.module.css';
import Logo from "../imagenes/logo proyecto color.jpeg";
import Logoempresarial from "../imagenes/logo empresarial.png";
import ChatbotIcon from "../imagenes/img chatbot.png";

const EncuestaSatisfaccion = () => {
  // Estados del componente
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Estados del formulario
  const [calificacion, setCalificacion] = useState("");
  const [comentario, setComentario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const nombre = localStorage.getItem("nombre");
  const userRole = localStorage.getItem("rol");
  const isAdminOrTech = ["admin", "tecnico"].includes(userRole);

  // Handlers del menú
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleMenu = () => setIsMenuExpanded(!isMenuExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleSupport = () => {
    setIsSupportOpen(!isSupportOpen);
    setIsAdminOpen(false);
    setIsConfigOpen(false);
  };

  const toggleAdmin = () => {
    setIsAdminOpen(!isAdminOpen);
    setIsSupportOpen(false);
    setIsConfigOpen(false);
  };

  const toggleConfig = () => {
    setIsConfigOpen(!isConfigOpen);
    setIsSupportOpen(false);
    setIsAdminOpen(false);
  };

  // Cargar datos del ticket si es necesario
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/EncuestaSatisfaccion/:surveyId");
    }
  }, [navigate]);

  // Función para enviar la encuesta
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!calificacion) {
      setError("Por favor seleccione una calificación");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/encuestasatisfaccion`,
        {
          ticketId: surveyId,
          calificacion: parseInt(calificacion),
          comentario,
          fecha: new Date().toISOString(),
          usuario: nombre || "Anónimo"
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.status === 200) {
        setSubmitSuccess(true);
        // Redirigir después de 3 segundos
        setTimeout(() => {
          navigate("/Tickets");
        }, 3000);
      }
    } catch (err) {
      console.error("Error al enviar encuesta:", err);
      setError(err.response?.data?.message || "Error al enviar la encuesta");
      
      if (err.response?.status === 401) {
        navigate("/Tickets");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navegación según rol
  const getRouteByRole = (section) => {
    if (section === 'inicio') {
      if (userRole === 'administrador') {
        return '/HomeAdmiPage';
      } else if (userRole === 'tecnico') {
        return '/HomeTecnicoPage';
      } else {
        return '/home';
      }
    } else if (section === 'crear-caso') {
      if (userRole === 'administrador') {
        return '/CrearCasoAdmin';
      } else if (userRole === 'tecnico') {
        return '/CrearCasoAdmin';
      } else {
        return '/CrearCasoUse';
      }
    } else if (section === "tickets") return "/Tickets";
    return "/";
  };

  
  return (
    <div className={styles.containerPrincipal}>
      
      <div
        className={styles.containerColumnas}
        style={{ marginLeft: isMenuExpanded ? "200px" : "60px" }}
      >
        <div className={styles.encuestaContainer}>
          <h1>Encuesta de Satisfacción - Ticket #{surveyId}</h1>
          
          {submitSuccess ? (
            <div className={styles.successMessage}>
              <p>¡Gracias por tu feedback! La encuesta ha sido enviada correctamente.</p>
              <p>Redirigiendo a la página de tickets...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>¿Cómo calificaría el servicio recibido?</label>
                <select 
                  value={calificacion}
                  onChange={(e) => setCalificacion(e.target.value)}
                  required
                  className={error && !calificacion ? styles.errorInput : ""}
                >
                  <option value="">Seleccione...</option>
                  <option value="5">Excelente (5)</option>
                  <option value="4">Muy Bueno (4)</option>
                  <option value="3">Bueno (3)</option>
                  <option value="2">Regular (2)</option>
                  <option value="1">Deficiente (1)</option>
                </select>
                {error && !calificacion && (
                  <span className={styles.errorText}>{error}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Comentarios adicionales:</label>
                <textarea
                  rows="4"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="(Opcional) ¿Algo que nos quieras comentar sobre el servicio recibido?"
                />
              </div>

              {error && calificacion && (
                <div className={styles.errorMessage}>{error}</div>
              )}

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Encuesta"}
              </button>
            </form>
          )}
        </div>
      </div>

      
    </div>
  );
};

export default EncuestaSatisfaccion;