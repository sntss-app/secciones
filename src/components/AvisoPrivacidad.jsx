// src/components/AvisoPrivacidad.jsx
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { 
    FaFileAlt, FaShieldAlt, FaLock, FaUserSecret, 
    FaCheckCircle, FaTimes, FaRocket, FaStar,
    FaClipboardCheck, FaGavel, FaHandshake
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const AvisoPrivacidad = ({ show, onHide }) => {
    const [loading, setLoading] = useState(false);

    const handleClose = async () => {
        if (loading) return;
        onHide();
    };

    // Estilos modernos
    const styles = {
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: show ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)',
        },
        modalContent: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex',
            flexDirection: 'column',
        },
        modalHeader: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 100%)',
            color: 'white',
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '4px solid #3EAEF4',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 10,
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        headerIcon: {
            fontSize: '2rem',
            color: '#3EAEF4',
        },
        headerTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
        },
        headerBadge: {
            display: 'inline-block',
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            padding: '0.2rem 0.8rem',
            borderRadius: '12px',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            marginTop: '0.2rem',
        },
        closeButton: {
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalBody: {
            padding: '2rem',
            overflowY: 'auto',
            flex: 1,
            fontSize: '0.9rem',
            lineHeight: '1.7',
            color: '#333',
        },
        modalFooter: {
            padding: '1rem 2rem',
            borderTop: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            flexShrink: 0,
            background: '#f8fafc',
        },
        btnClose: {
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        btnAccept: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        // Estilos para el contenido
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            marginTop: '1.5rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '2px solid #3EAEF4',
            paddingBottom: '0.3rem',
        },
        sectionIcon: {
            color: '#3EAEF4',
        },
        highlightBox: {
            backgroundColor: 'rgba(62,174,244,0.08)',
            borderLeft: '4px solid #3EAEF4',
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0',
        },
        listStyled: {
            paddingLeft: '1.5rem',
            marginBottom: '0.5rem',
        },
        listItem: {
            marginBottom: '0.3rem',
            paddingLeft: '0.5rem',
        },
        textMuted: {
            color: '#6c757d',
            fontStyle: 'italic',
        },
        badgeUpdated: {
            display: 'inline-block',
            backgroundColor: '#28a745',
            color: 'white',
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
        },
    };

    return (
        <div style={styles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget && !loading) handleClose();
        }}>
            <div style={styles.modalContent}>
                {/* Header */}
                <div style={styles.modalHeader}>
                    <div style={styles.headerLeft}>
                        <FaShieldAlt style={styles.headerIcon} />
                        <div>
                            <h4 style={styles.headerTitle}>Aviso de Privacidad Integral</h4>
                            <span style={styles.headerBadge}>
                                <FaLock style={{ marginRight: '4px' }} /> Protección de Datos
                            </span>
                        </div>
                    </div>
                    <button 
                        style={styles.closeButton}
                        onClick={() => handleClose()}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.transform = 'rotate(90deg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.transform = 'rotate(0)';
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div style={styles.modalBody}>
                    <h5 style={styles.sectionTitle}>
                        <FaFileAlt style={styles.sectionIcon} /> AVISO DE PRIVACIDAD INTEGRAL
                    </h5>
                    <p>
                        El Sindicato Nacional de Trabajadores del Seguro Social, con domicilio en la Calle de Zamora # 107, Colonia Condesa, Delegación Cuauhtémoc, Ciudad de México, Código Postal 06140, es el responsable del tratamiento de los datos personales que nos proporcione, los cuales serán protegidos conforme a la dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, su reglamento y demás normatividad que resulte aplicable.
                    </p>

                    <h6 style={styles.sectionTitle}>
                        <FaUserSecret style={styles.sectionIcon} /> PARA EL CUMPLIMIENTO DE DICHAS FINALIDADES, SE REQUERIRÁ DE MANERA PARCIAL O TOTAL DE LA SIGUIENTE INFORMACIÓN PERSONAL:
                    </h6>
                    <p>
                        Nombre completo, Domicilio actual, Edad, Estado Civil, Teléfono fijo y/o celular, Correo electrónico en caso de tenerlo, Identificación oficial, Delegación Sindical, matrícula, Departamento, fecha de ingreso, número de seguridad social, Especialidad, Nacionalidad, fecha de solicitud de licencia, fecha de nacimiento, CURP, Salario, Concepto, Número de Plaza, tipo de Contratación, Número de Afiliación, Registro Federal de Contribuyentes, Fotografía en caso de becas, Unidad de Medicina Familiar, Turno, Adscripción, Sección Sindical, Domicilio de la fuente de trabajo, Actividades laborales, Categoría o puesto, Antigüedad, Licencia Sindical, Firma, Nombre completo de beneficiarios (en caso de tramites de designación de beneficiario en juicio o en pliego testamentario, en caso de defunción fecha de la misma, nombre, firma, domicilio y adscripción (en el caso de los testigos de la suscripción del pliego testamentario), beneficiarios para prestaciones relativas a deportes y acción femenil y domicilio de los mismos, en caso de Seguro de RC (Especialidad, Cédula Profesional y Escolaridad, Práctica Quirúrgica, datos de reclamación judicial o extrajudicial), fecha de aplicación de la sanción en su caso y copia simple de los documentos oficiales que comprueben lo relacionado con los datos personales antes mencionados en caso de ser necesarios, lo que quedaran en guarda de la organización.
                    </p>

                    <h6 style={styles.sectionTitle}>
                        <FaShieldAlt style={styles.sectionIcon} /> DATOS PERSONALES SENSIBLES
                    </h6>
                    <div style={styles.highlightBox}>
                        <p style={{ margin: 0 }}>
                            <strong>⚠️ Importante:</strong> Se pueden solicitar datos personales sensibles (por ejemplo: estado de salud pasado y/o presente y los derivados para las finalidades previstas), en cuyo caso se recaba su firma autógrafa para el caso de los datos personales sensibles para que el titular otorgue su consentimiento expreso para el tratamiento de tales datos personales.
                        </p>
                    </div>
                    <p>
                        Del mismo modo, al proporcionar los datos personales sensibles de los dependientes de los socios sindicales ya sea por su minoría de edad o estado de incapacidad, el legítimo representante, tutor y/o curador, los mismos firman el consentimiento en el que se reconoce y acepta que dichos individuos están enterados del tratamiento que se llevará a cabo con sus datos personales. La presente sección constituye la aceptación expresa del Titular respecto del tratamiento de sus datos personales sensibles, de conformidad con el artículo 8, párrafos segundo y cuarto; artículo 9 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. De igual manera se cumple con las formalidades del artículo 12 y 13 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
                    </p>

                    <h6 style={styles.sectionTitle}>
                        <FaClipboardCheck style={styles.sectionIcon} /> LA FINALIDAD DE USAR SUS DATOS PERSONALES ES:
                    </h6>
                    <p>
                        Para la derivación a las Secretarías del Comité Ejecutivo Nacional o Comisiones Nacionales o Secciones Sindicales de las solicitudes de atención correspondiente, esto en términos estatutarios y contractuales, para Integrar los requisitos establecidos en el artículo 377 la Ley Federal del Trabajo y los que se requieran para dar cumplimiento al Contrato Colectivo de Trabajo vigente, para la Creación de directorios, envío de comunicaciones internas, elaboración de estadísticas internas, elaboración de informes internos, elaboración de bases de datos internas, ejercer sus derechos sindicales previo cumplimiento de los requisitos establecidos en los Estatutos, para mantener actualizados los padrones de los miembros del Sindicato y de los integrantes de los Comités Ejecutivos Nacional, Seccional, Delegacionales, Subdelegacionales y Representaciones Sindicales en apego a los estatutos vigentes y el beneficio de licencia sindical que se encuentran contemplada en el Contrato Colectivo de Trabajo vigente, para elaboración de Dictámenes o peritajes, elaboración de demandas, promociones, recursos ordinarios y extraordinarios y amparos ante las autoridades competentes, asesoría y comparecencia en la oficina de relaciones laborales en procesos de investigación contractual, asesoría y comparecencia en el Órgano Interno de Control del IMSS, elaboración de Recurso de Reconsideración, para trámite de devolución de aportaciones de fondo de ayuda sindical por defunción en los casos establecidos en el reglamento respectivo, para llevar a cabo el trámite de pago de fondo de ayuda sindical por defunción en términos del reglamento respectivo, para las autorizaciones de procedencia de trámites relativos a la Secretaría de Previsión Social, elaboración de Pliegos Testamentarios, para el registro al Sorteo para la adquisición de créditos para automóvil, para el almacenamiento de pliegos testamentarios, para la búsqueda de antecedentes de pliego testamentario, para la inscripción inicial o renovación al seguro facultativo para familiares, para la Contratación del Seguro de Responsabilidad Civil para Trabajadores del IMSS, para la solicitud de atención médica fuera de su Zonificación, para la atención médica oportuna para Trabajadores del IMSS, para la entrega personal a los solicitantes del oficio de remisión que ellos mismos presentarán ante las Instituciones Educativas con las que se tiene convenio por parte del SNTSS, para el otorgamiento de los descuentos correspondientes, para la devolución de cancelaciones y otorgar el beneficio de la cláusula 97 del Contrato Colectivo de Trabajo, manejo de archivo central de concentración, para el proceso de selección de los trabajadores que participan en las Convocatorias que se emiten y que les permite obtener el derecho a una beca y realizar alguno de los cursos que se ofertan, para participar en el proceso de registro y selección en alguno de los cursos que se ofertan en las Convocatorias institucionales, para reconocimiento de antigüedad, para el cumplimiento del CCT y Reglamento Interior de Trabajo con el IMSS y sus agremiados, para tramitar las licencias que por conducto del Sindicato soliciten los agremiados, para el ejercicio de un crédito Hipotecario o Préstamo Personal a Mediano Plazo, Registro de Atención, Elaboración y expedición de propuestas Sindicales, Dispensas de edad, de escolaridad, segunda o tercera oportunidad de evaluación, Actualización al Catálogo de Plazas de Base, Inconformidades e Impugnaciones, Traslados de Expedientes, Cancelaciones de Cambios y Valoración de Excepciones, para realizar trámites relacionados con el alquiler de salones de fiestas, alquiler de autobuses para excursiones y/o compra de boletaje de las diferentes promociones que manejamos, para archivos de credenciales, registros de fútbol soccer, fútbol de salón y registros de la Selección Sub-20 de fútbol soccer, cursos sabatinos que imparte el sindicato, para cumplir con requisitos que pide la (SEP) Secretaría de Educación Pública, Dirección General de Bachillerato y de Preparatoria Abierta y así poder registrar al aspirante a preparatoria abierta ante la SEP y que sus estudios tengan validez oficial, que se puedan analizar y emitir dictámenes de las solicitudes de beca que presentan los trabajadores ante la Comisión Nacional Mixta de Becas, para atender solicitudes de Revocación, Investigación y Discrepancia, a fin de informar, modificar o cancelar sus condicionamientos de adscripción, para la nominación por promoción escalafonaria, para la integración de los expedientes relativos a los dictámenes de pensión jubilatoria, pensión por riesgo de trabajo, invalidez y cesantía en edad avanzada, en términos del régimen de jubilaciones y pensiones, para trámite de cambio de rama, cursos de verano e inscripción y reinscripción a sábados de integración familiar, para la Elaboración de expediente clínico médico y psicológico, estudios, análisis, actualización y conservación de su expediente clínico, para la Prestación de servicios médico y psicológico, en consultorio incluyendo de ser necesario estudios diagnóstico, atención de enfermería y demás fines relacionados con la salud, Conservación de registros, prestación de servicios en el futuro y en general para dar seguimiento a la atención como paciente. Promoción de los servicios e información para la salud. (curso de orientación médica, y psicológica), y medicina alternativa (reiki). Ferias de la salud en donde se realizará acciones de promoción para la salud, así como detecciones varias entre las cuales ser realizara, detección de cáncer de mama, cáncer cervicouterino y de próstata, en estos casos se canalizará a los pacientes con resultados sospechosos a los servicios que corresponda para su atención con la prontitud que el caso requiera, brigadas médicas y expedición de certificados para ingreso a deportivos del SNTSS y apoyo a eventos o torneos deportivos del SNTSS.
                    </p>

                    <div style={styles.highlightBox}>
                        <p style={{ margin: 0 }}>
                            <strong>📌 Finalidades adicionales:</strong> Análisis estadísticos en el marco de la planeación de actividades Sindicales.
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                            En caso de que no desee que sus datos personales sean tratados para estos fines adicionales, desde este momento usted nos puede comunicar lo anterior mediante oficio dirigido a la Unidad de Transparencia del S.N.T.S.S., o al correo electrónico interior.cen.sntssdp@hotmail.com
                        </p>
                    </div>

                    <h6 style={styles.sectionTitle}>
                        <FaGavel style={styles.sectionIcon} /> FUNDAMENTO PARA EL TRATAMIENTO DE DATOS PERSONALES
                    </h6>
                    <p>
                        Se tratan los datos personales antes señalados, con fundamento en los artículos 2, 3, 8, 15, 17 fracción II de la Ley Federal de protección de los Datos Personales en posesión de los particulares así como 26 y 27 de su reglamento.
                    </p>

                    <h6 style={styles.sectionTitle}>
                        <FaHandshake style={styles.sectionIcon} /> TRANSFERENCIA DE DATOS PERSONALES
                    </h6>
                    <p>
                        Conforme a las actividades propias y con el objeto de cumplir con las finalidades mencionadas, se podrán transferir, algunos de sus datos personales a terceros tales como:
                    </p>
                    <ul style={styles.listStyled}>
                        <li style={styles.listItem}>INSTITUTO MEXICANO DEL SEGURO SOCIAL</li>
                        <li style={styles.listItem}>SECRETARÍA DEL TRABAJO Y PREVISIÓN SOCIAL (DIRECCIÓN GENERAL DE REGISTRO DE ASOCIACIONES)</li>
                        <li style={styles.listItem}>AUTORIDADES LABORALES, ADMINISTRATIVAS O JUDICIALES COMPETENTES</li>
                        <li style={styles.listItem}>INAI</li>
                        <li style={styles.listItem}>SEGUROS ARGOS S.A. DE C.V.</li>
                        <li style={styles.listItem}>GRUPO MEXICANO DE SEGUROS (GMX)</li>
                        <li style={styles.listItem}>SECRETARIA DE EDUCACIÓN PÚBLICA</li>
                        <li style={styles.listItem}>INSTITUCIONES EDUCATIVAS CON LAS QUE SE TIENE CELEBRADO CONVENIO</li>
                    </ul>
                    <p>
                        Quienes se encontrarán obligados a darle a conocer su propio Aviso de Privacidad; lo anterior a fin de evitar daño, pérdida, destrucción, alteración o un tratamiento no autorizado de sus datos personales.
                    </p>
                    <p>
                        El titular podrá solicitar a la unidad de transparencia del S.N.T.S.S. a través de la dirección electrónica interior.cen.sntssdp@hotmail.com que se limite el uso o divulgación de sus datos personales con apego a la LFPDPPP.
                    </p>

                    <h6 style={styles.sectionTitle}>
                        <FaLock style={styles.sectionIcon} /> MEDIDAS DE SEGURIDAD
                    </h6>
                    <p>
                        Con el fin de evitar el uso o divulgación no autorizada de sus datos personales, se han adoptado las medidas físicas, administrativas y técnicas necesarias para garantizar el adecuado tratamiento de sus datos personales; únicamente el personal autorizado podrá participar en el tratamiento que se haga de sus datos personales, quienes tendrán estrictamente prohibido utilizar sus datos para fines distintitos a los descritos y estarán obligados a guardar el deber de confidencialidad necesario, inclusive después de terminada la relación con el Sindicato.
                    </p>

                    <h6 style={styles.sectionTitle}>
                        <FaCheckCircle style={styles.sectionIcon} /> DERECHOS ARCO
                    </h6>
                    <p>
                        Le informamos que en todo momento podrá hacer uso el titular o su representante debidamente acreditado y con poder para representarlo del <strong>Acceso, Rectificación, Cancelación u Oposición -Derechos ARCO-</strong>.
                    </p>
                    <div style={styles.highlightBox}>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>
                            <strong>📧 Contacto para Derechos ARCO:</strong> transparencia.sntss@gmail.com
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                            <strong>📍 Domicilio:</strong> Calle Zamora 107, Colonia Condesa, Delegación Cuauhtémoc, Ciudad de México, C.P. 06140, sexto piso Secretaria del Interior y Propaganda
                        </p>
                    </div>

                    <h6 style={styles.sectionTitle}>
                        <FaRocket style={styles.sectionIcon} /> CAMBIOS AL AVISO DE PRIVACIDAD
                    </h6>
                    <p>
                        En caso de que exista alguna actualización de este aviso de privacidad, lo haremos de su conocimiento en esta misma oficina o para más información, puede consultar el aviso de privacidad integral en <strong>www.sntss.org.mx</strong>
                    </p>

                    <p style={styles.textMuted}>
                        <span style={styles.badgeUpdated}>📅 ACTUALIZACIÓN</span> 15 de Septiembre de 2017.
                    </p>
                </div>

                {/* Footer */}
                <div style={styles.modalFooter}>
                    <button 
                        style={styles.btnClose}
                        onClick={() => handleClose()}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#5a6268';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#6c757d';
                        }}
                    >
                        <FaTimes style={{ marginRight: '6px' }} /> Cerrar
                    </button>
                    <button 
                        style={styles.btnAccept}
                        onClick={() => handleClose()}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(62,174,244,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <FaCheckCircle style={{ marginRight: '6px' }} /> Acepto y entiendo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvisoPrivacidad;