// src/components/AvisoPrivacidad.jsx
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaFileAlt } from 'react-icons/fa';

const AvisoPrivacidad = ({ show, onHide }) => {
    return (
        <Modal show={show} onHide={onHide} size="lg" scrollable>
            <Modal.Header closeButton style={{ backgroundColor: '#0A0F1E', color: 'white' }}>
                <Modal.Title>
                    <FaFileAlt className="me-2" /> Aviso de Privacidad Integral
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                <h5>AVISO DE PRIVACIDAD INTEGRAL</h5>
                <p>
                    El Sindicato Nacional de Trabajadores del Seguro Social, con domicilio en la Calle de Zamora # 107, Colonia Condesa, Delegación Cuauhtémoc, Ciudad de México, Código Postal 06140, es el responsable del tratamiento de los datos personales que nos proporcione, los cuales serán protegidos conforme a la dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, su reglamento y demás normatividad que resulte aplicable.
                </p>

                <h6 className="mt-3 fw-bold">PARA EL CUMPLIMIENTO DE DICHAS FINALIDADES, SE REQUERIRÁ DE MANERA PARCIAL O TOTAL DE LA SIGUIENTE INFORMACIÓN PERSONAL:</h6>
                <p>
                    Nombre completo, Domicilio actual, Edad, Estado Civil, Teléfono fijo y/o celular, Correo electrónico en caso de tenerlo, Identificación oficial, Delegación Sindical, matrícula, Departamento, fecha de ingreso, número de seguridad social, Especialidad, Nacionalidad, fecha de solicitud de licencia, fecha de nacimiento, CURP, Salario, Concepto, Número de Plaza, tipo de Contratación, Número de Afiliación, Registro Federal de Contribuyentes, Fotografía en caso de becas, Unidad de Medicina Familiar, Turno, Adscripción, Sección Sindical, Domicilio de la fuente de trabajo, Actividades laborales, Categoría o puesto, Antigüedad, Licencia Sindical, Firma, Nombre completo de beneficiarios (en caso de tramites de designación de beneficiario en juicio o en pliego testamentario, en caso de defunción fecha de la misma, nombre, firma, domicilio y adscripción (en el caso de los testigos de la suscripción del pliego testamentario), beneficiarios para prestaciones relativas a deportes y acción femenil y domicilio de los mismos, en caso de Seguro de RC (Especialidad, Cédula Profesional y Escolaridad, Práctica Quirúrgica, datos de reclamación judicial o extrajudicial), fecha de aplicación de la sanción en su caso y copia simple de los documentos oficiales que comprueben lo relacionado con los datos personales antes mencionados en caso de ser necesarios, lo que quedaran en guarda de la organización.
                </p>

                <h6 className="mt-3 fw-bold">DATOS PERSONALES SENSIBLES</h6>
                <p>
                    Se pueden solicitar datos personales sensibles (por ejemplo: estado de salud pasado y/o presente y los derivados para las finalidades previstas), en cuyo caso se recaba su firma autógrafa para el caso de los datos personales sensibles para que el titular otorgue su consentimiento expreso para el tratamiento de tales datos personales. Del mismo modo, al proporcionar los datos personales sensibles de los dependientes de los socios sindicales ya sea por su minoría de edad o estado de incapacidad, el legítimo representante, tutor y/o curador, los mismos firman el consentimiento en el que se reconoce y acepta que dichos individuos están enterados del tratamiento que se llevará a cabo con sus datos personales. La presente sección constituye la aceptación expresa del Titular respecto del tratamiento de sus datos personales sensibles, de conformidad con el artículo 8, párrafos segundo y cuarto; artículo 9 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. De igual manera se cumple con las formalidades del artículo 12 y 13 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
                </p>

                <h6 className="mt-3 fw-bold">LA FINALIDAD DE USAR SUS DATOS PERSONALES ES:</h6>
                <p>
                    Para la derivación a las Secretarías del Comité Ejecutivo Nacional o Comisiones Nacionales o Secciones Sindicales de las solicitudes de atención correspondiente, esto en términos estatutarios y contractuales, para Integrar los requisitos establecidos en el artículo 377 la Ley Federal del Trabajo y los que se requieran para dar cumplimiento al Contrato Colectivo de Trabajo vigente, para la Creación de directorios, envío de comunicaciones internas, elaboración de estadísticas internas, elaboración de informes internos, elaboración de bases de datos internas, ejercer sus derechos sindicales previo cumplimiento de los requisitos establecidos en los Estatutos, para mantener actualizados los padrones de los miembros del Sindicato y de los integrantes de los Comités Ejecutivos Nacional, Seccional, Delegacionales, Subdelegacionales y Representaciones Sindicales en apego a los estatutos vigentes y el beneficio de licencia sindical que se encuentran contemplada en el Contrato Colectivo de Trabajo vigente, para elaboración de Dictámenes o peritajes, elaboración de demandas, promociones, recursos ordinarios y extraordinarios y amparos ante las autoridades competentes, asesoría y comparecencia en la oficina de relaciones laborales en procesos de investigación contractual, asesoría y comparecencia en el Órgano Interno de Control del IMSS, elaboración de Recurso de Reconsideración, para trámite de devolución de aportaciones de fondo de ayuda sindical por defunción en los casos establecidos en el reglamento respectivo, para llevar a cabo el trámite de pago de fondo de ayuda sindical por defunción en términos del reglamento respectivo, para las autorizaciones de procedencia de trámites relativos a la Secretaría de Previsión Social, elaboración de Pliegos Testamentarios, para el registro al Sorteo para la adquisición de créditos para automóvil, para el almacenamiento de pliegos testamentarios, para la búsqueda de antecedentes de pliego testamentario, para la inscripción inicial o renovación al seguro facultativo para familiares, para la Contratación del Seguro de Responsabilidad Civil para Trabajadores del IMSS, para la solicitud de atención médica fuera de su Zonificación, para la atención médica oportuna para Trabajadores del IMSS, para la entrega personal a los solicitantes del oficio de remisión que ellos mismos presentarán ante las Instituciones Educativas con las que se tiene convenio por parte del SNTSS, para el otorgamiento de los descuentos correspondientes, para la devolución de cancelaciones y otorgar el beneficio de la cláusula 97 del Contrato Colectivo de Trabajo, manejo de archivo central de concentración, para el proceso de selección de los trabajadores que participan en las Convocatorias que se emiten y que les permite obtener el derecho a una beca y realizar alguno de los cursos que se ofertan, para participar en el proceso de registro y selección en alguno de los cursos que se ofertan en las Convocatorias institucionales, para reconocimiento de antigüedad, para el cumplimiento del CCT y Reglamento Interior de Trabajo con el IMSS y sus agremiados, para tramitar las licencias que por conducto del Sindicato soliciten los agremiados, para el ejercicio de un crédito Hipotecario o Préstamo Personal a Mediano Plazo, Registro de Atención, Elaboración y expedición de propuestas Sindicales, Dispensas de edad, de escolaridad, segunda o tercera oportunidad de evaluación, Actualización al Catálogo de Plazas de Base, Inconformidades e Impugnaciones, Traslados de Expedientes, Cancelaciones de Cambios y Valoración de Excepciones, para realizar trámites relacionados con el alquiler de salones de fiestas, alquiler de autobuses para excursiones y/o compra de boletaje de las diferentes promociones que manejamos, para archivos de credenciales, registros de fútbol soccer, fútbol de salón y registros de la Selección Sub-20 de fútbol soccer, cursos sabatinos que imparte el sindicato, para cumplir con requisitos que pide la (SEP) Secretaría de Educación Pública, Dirección General de Bachillerato y de Preparatoria Abierta y así poder registrar al aspirante a preparatoria abierta ante la SEP y que sus estudios tengan validez oficial, que se puedan analizar y emitir dictámenes de las solicitudes de beca que presentan los trabajadores ante la Comisión Nacional Mixta de Becas, para atender solicitudes de Revocación, Investigación y Discrepancia, a fin de informar, modificar o cancelar sus condicionamientos de adscripción, para la nominación por promoción escalafonaria, para la integración de los expedientes relativos a los dictámenes de pensión jubilatoria, pensión por riesgo de trabajo, invalidez y cesantía en edad avanzada, en términos del régimen de jubilaciones y pensiones, para trámite de cambio de rama, cursos de verano e inscripción y reinscripción a sábados de integración familiar, para la Elaboración de expediente clínico médico y psicológico, estudios, análisis, actualización y conservación de su expediente clínico, para la Prestación de servicios médico y psicológico, en consultorio incluyendo de ser necesario estudios diagnóstico, atención de enfermería y demás fines relacionados con la salud, Conservación de registros, prestación de servicios en el futuro y en general para dar seguimiento a la atención como paciente. Promoción de los servicios e información para la salud. (curso de orientación médica, y psicológica), y medicina alternativa (reiki). Ferias de la salud en donde se realizará acciones de promoción para la salud, así como detecciones varias entre las cuales ser realizara, detección de cáncer de mama, cáncer cervicouterino y de próstata, en estos casos se canalizará a los pacientes con resultados sospechosos a los servicios que corresponda para su atención con la prontitud que el caso requiera, brigadas médicas y expedición de certificados para ingreso a deportivos del SNTSS y apoyo a eventos o torneos deportivos del SNTSS.
                </p>

                <p className="mt-3">
                    <strong>De manera adicional, utilizaremos su información personal para las siguientes finalidades que no son necesarias para el servicio que otorgamos, pero que nos permiten y facilitan brindarle una mejor atención:</strong> Análisis estadísticos en el marco de la planeación de actividades Sindicales.
                </p>
                <p>
                    En caso de que no desee que sus datos personales sean tratados para estos fines adicionales, desde este momento usted nos puede comunicar lo anterior mediante oficio dirigido a la Unidad de Transparencia del S.N.T.S.S., o al correo electrónico interior.cen.sntssdp@hotmail.com acompañando los siguientes datos: Nombre del titular, matricula, adscripción, domicilio, correo electrónico y la descripción exacta de los datos personales adicionales que menciona.
                </p>

                <h6 className="mt-3 fw-bold">FUNDAMENTO PARA EL TRATAMIENTO DE DATOS PERSONALES.</h6>
                <p>
                    Se tratan los datos personales antes señalados, con fundamento en los artículos 2, 3, 8, 15, 17 fracción II de la Ley Federal de protección de los Datos Personales en posesión de los particulares así como 26 y 27 de su reglamento.
                </p>

                <h6 className="mt-3 fw-bold">TRANSFERENCIA DE DATOS PERSONALES.</h6>
                <p>
                    Conforme a las actividades propias y con el objeto de cumplir con las finalidades mencionadas, se podrán transferir, algunos de sus datos personales a terceros tales como:
                </p>
                <ul>
                    <li>INSTITUTO MEXICANO DEL SEGURO SOCIAL</li>
                    <li>SECRETARÍA DEL TRABAJO Y PREVISIÓN SOCIAL (DIRECCIÓN GENERAL DE REGISTRO DE ASOCIACIONES)</li>
                    <li>AUTORIDADES LABORALES, ADMINISTRATIVAS O JUDICIALES COMPETENTES.</li>
                    <li>INAI</li>
                    <li>SEGUROS ARGOS S.A. DE C.V.</li>
                    <li>GRUPO MEXICANO DE SEGUROS (GMX)</li>
                    <li>SECRETARIA DE EDUCACIÓN PÚBLICA</li>
                    <li>INSTITUCIONES EDUCATIVAS CON LAS QUE SE TIENE CELEBRADO CONVENIO.</li>
                </ul>
                <p>
                    Quienes se encontrarán obligados a darle a conocer su propio Aviso de Privacidad; lo anterior a fin de evitar daño, pérdida, destrucción, alteración o un tratamiento no autorizado de sus datos personales.
                </p>
                <p>
                    El titular podrá solicitar a la unidad de transparencia del S.N.T.S.S. a través de la dirección electrónica interior.cen.sntssdp@hotmail.com que se limite el uso o divulgación de sus datos personales con apego a la LFPDPPP.
                </p>

                <h6 className="mt-3 fw-bold">MEDIDAS DE SEGURIDAD</h6>
                <p>
                    Con el fin de evitar el uso o divulgación no autorizada de sus datos personales, se han adoptado las medidas físicas, administrativas y técnicas necesarias para garantizar el adecuado tratamiento de sus datos personales; únicamente el personal autorizado podrá participar en el tratamiento que se haga de sus datos personales, quienes tendrán estrictamente prohibido utilizar sus datos para fines distintitos a los descritos y estarán obligados a guardar el deber de confidencialidad necesario, inclusive después de terminada la relación con el Sindicato
                </p>

                <h6 className="mt-3 fw-bold">DERECHOS ARCO:</h6>
                <p>
                    Le informamos que en todo momento podrá hacer uso el titular o su representante debidamente acreditado y con poder para representarlo del Acceso, Rectificación, Cancelación u Oposición -Derechos ARCO-. Para lo anterior; El titular, en términos de lo dispuesto por el artículo 23 de la Ley, tiene derecho a obtener del Responsable sus datos personales, así como información relativa a las condiciones y generalidades del tratamiento (Acceso); El titular, de conformidad con lo dispuesto por el artículo 24 de la Ley, podrá solicitar en todo momento al responsable que rectifique sus datos personales que resulten ser inexactos o incompletos (Rectificación); El titular podrá solicitar en todo momento al responsable la cancelación de los datos personales cuando considere que los mismos no están siendo tratados conforme a los principios y deberes que establece la LFPDPPP y el Reglamento (Cancelación); En términos del artículo 27 de la Ley, él titular podrá, en todo momento, oponerse al tratamiento de sus datos personales o exigir que se cese en el mismo (Oposición).
                </p>
                <p>
                    Los Derechos ARCO- Acceso, Rectificación, Cancelación u Oposición podrán ser ejercidos por él titular previa acreditación de su identidad, debiendo adjuntar copia de su identificación oficial vigente (INE, Pasaporte, Cedula Profesional o Cartilla Militar) o a través del representante del titular previa acreditación de la identidad del representante y la acreditación de la representación, mediante instrumento notarial o carta poder firmada por el titular y ante la presencia de dos testigos o declaración en comparecencia de él titular. Para el ejercicio de los -Derechos ARCO- de menores de edad o de personas que se encuentren en estado de incapacidad o interdicción lo ejercerán los padres o el tutor, como está instituido en el Código Civil Federal. PROCEDIMIENTO PARA EJERCER LOS DERECHOS ARCO: El procedimiento para poder ejercer los -Derechos ARCO- Él titular o su representante con los requisitos que ya se mencionaron, requerirá a la Unidad de Transparencia del (S.N.T.S.S.) con domicilio en Calle Zamora 107, Colonia Condesa, Delegación Cuauhtémoc, Ciudad de México, C.P. 06140, sexto piso Secretaria del Interior y Propaganda o a través de la dirección electrónica transparencia.sntss@gmail.com, el formato de Solicitud para ejercer los -Derechos ARCO- para lo anterior, deberá contener y acompañar lo siguiente: Nombre del titular, domicilio, dirección electrónica u otro medio para comunicarle la respuesta a su solicitud; Los documentos que acrediten la identidad o, en su caso, la representación del titular; La descripción clara y precisa de los datos personales respecto de los que se busca ejercer alguno de los derechos antes mencionados, y cualquier otro elemento o documento que facilite la localización de los datos personales.
                </p>
                <p>
                    Si requiere ejercer el derecho de Rectificación de sus Datos Personales, deberá de indicar la corrección o actualización que requiera que se modifiquen, debiendo de aportar los documentos probatorios para sustentar la solicitud.
                </p>
                <p>
                    En términos de lo previsto por el artículo 32 de la LFPDPPP, el (S.N.T.S.S.) como Responsable comunicara en un plazo máximo de veinte días hábiles, contados desde la fecha en que se recibió la solicitud de Acceso, Rectificación, Cancelación u Oposición, al titular la determinación adoptada en el domicilio, dirección electrónica u otro medio que estableció para comunicarle la respuesta a su solicitud, a efecto de que, si resulta procedente, se haga efectiva la misma dentro de los quince días siguientes a la fecha en que se comunica la respuesta al titular.
                </p>
                <p>
                    Tratándose de solicitudes de Acceso de Datos Personales el (S.N.T.S.S.) procederá a la entrega de copia simple del documento o a través de medio electrónico de manera gratuita, previa acreditación de la identidad del solicitante o de su representante legal según corresponda, si el titular reitera su solicitud en un periodo menor a doce meses los costos no serán mayores a tres días de salario mínimo general vigente en el Distrito Federal (Sic) de conformidad con el artículo 35 LFPDPPP.
                </p>
                <p>
                    El titular en todo momento podrá Revocar el consentimiento que nos haya otorgado para el tratamiento de los Datos Personales. Considerando que es importante que tenga en cuenta que no en todos los caso podremos atender la solicitud de Revocación de consentimiento ya que por alguna obligación legal se requiera seguir tratando Datos Personales y deberá considerar que la solicitud de Revocación de consentimiento implicaría que se interrumpa el procedimiento en los beneficios y prestaciones del contrato colectivo de trabajo y ejercer derechos dentro del marco estatutario.
                </p>

                <h6 className="mt-3 fw-bold">CAMBIOS AL AVISO DE PRIVACIDAD.</h6>
                <p>
                    En caso de que exista alguna actualización de este aviso de privacidad, lo haremos de su conocimiento en esta misma oficina o para más información, puede consultar el aviso de privacidad integral en www.sntss.org.mx
                </p>

                <p className="mt-3 text-muted">ACTUALIZACIÓN 15 de Septiembre de 2017.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AvisoPrivacidad;