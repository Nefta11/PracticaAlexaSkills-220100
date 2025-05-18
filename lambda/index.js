/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

// Respuestas centralizadas para reutilización
const RESPUESTAS = {
    BIENVENIDA: '¡Hola! Bienvenido a mi primer Skill. Fui creado por Neftali Vergara. Puedes preguntarme sobre quién creó esta skill, qué carrera estudia, su color favorito o su grupo musical favorito.',
    REPROMPT: 'Puedes preguntarme sobre quién creó esta skill, qué carrera estudia, su color favorito o su grupo musical favorito.',
    QUIEN_CREO: '¡Fui creada por mi amo el inigualable TSU Neftali Arturo Hernández Vergara!',
    CARRERA: 'El Estudia la Ingeniería en desarrollo y gestión de software.',
    COLOR_FAVORITO: 'Su color favorito es el Rojo y Blanco.',
    GRUPO_FAVORITO: 'El cantante de indie y uno de sus grupos favoritos es The strokes y zoe.',
    NO_ENTIENDO: 'No entendí tu pregunta. Puedes preguntarme sobre quién creó esta skill, qué carrera estudia, su color favorito o su grupo musical favorito.',
    FUERA_DE_ALCANCE: 'Lo siento, no tengo información sobre eso. Yo solo puedo hablar sobre mi creador, Neftali. ¿Te gustaría saber quién me creó, qué carrera estudia, su color favorito o su grupo musical favorito?',
    DESPEDIDA: '¡Hasta luego! Gracias por usar mi skill.',
    ERROR: 'Lo siento, tuve problemas para hacer lo que pediste. Por favor, inténtalo de nuevo.',
    AYUDA: 'Puedes preguntarme sobre quién creó esta skill, qué carrera estudia, su color favorito o su grupo musical favorito. ¿Qué te gustaría saber?'
};

// Función auxiliar para construir respuestas estándar
const crearRespuesta = (handlerInput, mensaje, reprompt = null) => {
    const builder = handlerInput.responseBuilder.speak(mensaje);
    if (reprompt) {
        builder.reprompt(reprompt);
    }
    return builder.getResponse();
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        return crearRespuesta(handlerInput, RESPUESTAS.BIENVENIDA, RESPUESTAS.REPROMPT);
    }
};

const SaludoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SaludoIntent';
    },
    handle(handlerInput) {
        return crearRespuesta(handlerInput, RESPUESTAS.BIENVENIDA, RESPUESTAS.REPROMPT);
    }
};

// Función de fábrica para crear handlers de intent similares
const crearIntentHandler = (nombreIntent, respuesta, reprompt = RESPUESTAS.REPROMPT) => {
    return {
        canHandle(handlerInput) {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                && Alexa.getIntentName(handlerInput.requestEnvelope) === nombreIntent;
        },
        handle(handlerInput) {
            return crearRespuesta(handlerInput, respuesta, reprompt);
        }
    };
};

// Crear handlers específicos usando la función de fábrica
const QuienCreoIntentHandler = crearIntentHandler('QuienCreoIntent', RESPUESTAS.QUIEN_CREO);
const CarreraIntentHandler = crearIntentHandler('CarreraIntent', RESPUESTAS.CARRERA);
const ColorFavoritoIntentHandler = crearIntentHandler('ColorFavoritoIntent', RESPUESTAS.COLOR_FAVORITO);
const GrupoFavoritoIntentHandler = crearIntentHandler('GrupoFavoritoIntent', RESPUESTAS.GRUPO_FAVORITO);
const HelpIntentHandler = crearIntentHandler('AMAZON.HelpIntent', RESPUESTAS.AYUDA);

// Intent para capturar cualquier pregunta no reconocida
const FallbackCreadorIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        // Obtener y procesar el input del usuario
        const intent = handlerInput.requestEnvelope.request.intent;
        const request = handlerInput.requestEnvelope.request;
        
        // Construir el texto del usuario de múltiples fuentes posibles
        let userInput = '';
        
        // Extraer de slots si existen
        if (intent && intent.slots) {
            userInput = Object.values(intent.slots)
                .filter(slot => slot.value)
                .map(slot => slot.value.toLowerCase())
                .join(' ');
        }
        
        // Añadir razón si está disponible
        if (request.reason) {
            userInput += ' ' + request.reason.toLowerCase();
        }
        
        // Registrar lo que dijo el usuario para debugging
        console.log('User input:', userInput);
        
        // Palabras clave para cada tipo de pregunta
        const keywords = {
            quien: ['quien', 'creó', 'creo', 'nombre', 'skill', 'desarrolló', 'hizo', 'creador', 'desarrollador', 'programador'],
            carrera: ['carrera', 'estudia', 'profesión', 'trabajo', 'estudiante', 'universidad', 'escuela', 'ingeniería', 'ingenieria'],
            color: ['color', 'favorito', 'gusta', 'preferido', 'rojo', 'blanco'],
            musica: ['grupo', 'cantante', 'música', 'musica', 'canción', 'cancion', 'artista', 'banda', 'strokes', 'zoe']
        };
        
        // Palabras irrelevantes que indican una pregunta fuera del ámbito
        const palabrasIrrelevantes = [
            'clima', 'tiempo', 'noticias', 'deportes', 'receta', 'cocinar', 'película', 'pelicula', 
            'historia', 'política', 'politica', 'economía', 'economia', 'salud', 'medicina', 
            'juegos', 'videojuegos', 'viajes', 'hotel', 'restaurante', 'comida'
        ];
        
        // Revisar si la pregunta está fuera del ámbito de la skill
        if (palabrasIrrelevantes.some(palabra => userInput.includes(palabra))) {
            return crearRespuesta(handlerInput, RESPUESTAS.FUERA_DE_ALCANCE, RESPUESTAS.REPROMPT);
        }
        
        // Revisar coincidencias con palabras clave
        for (const [tipo, palabras] of Object.entries(keywords)) {
            if (palabras.some(palabra => userInput.includes(palabra))) {
                switch(tipo) {
                    case 'quien': 
                        return crearRespuesta(handlerInput, RESPUESTAS.QUIEN_CREO, RESPUESTAS.REPROMPT);
                    case 'carrera': 
                        return crearRespuesta(handlerInput, RESPUESTAS.CARRERA, RESPUESTAS.REPROMPT);
                    case 'color': 
                        return crearRespuesta(handlerInput, RESPUESTAS.COLOR_FAVORITO, RESPUESTAS.REPROMPT);
                    case 'musica': 
                        return crearRespuesta(handlerInput, RESPUESTAS.GRUPO_FAVORITO, RESPUESTAS.REPROMPT);
                }
            }
        }
        
        // Si no tiene palabras irrelevantes pero tampoco coincide con nuestras categorías
        return crearRespuesta(handlerInput, RESPUESTAS.NO_ENTIENDO, RESPUESTAS.REPROMPT);
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return crearRespuesta(handlerInput, RESPUESTAS.DESPEDIDA);
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        // Para intents desconocidos, redirigir a un mensaje más amigable
        return crearRespuesta(handlerInput, RESPUESTAS.NO_ENTIENDO, RESPUESTAS.REPROMPT);
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
        return crearRespuesta(handlerInput, RESPUESTAS.ERROR, RESPUESTAS.ERROR);
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SaludoIntentHandler,
        QuienCreoIntentHandler,
        CarreraIntentHandler,
        ColorFavoritoIntentHandler,
        GrupoFavoritoIntentHandler,
        FallbackCreadorIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();