# Principios de diseño — Reglas obligatorias

## SOLID aplicado a Angular

**S — Responsabilidad única**
Un formulario de bloque solo gestiona sus datos estáticos.
SelectorServiciosDinamicos solo gestiona la selección de TipoPublicacion.
Un servicio GraphQL encapsula solo las queries de su dominio.

**O — Abierto/cerrado**
Agregar un nuevo bloque inteligente = crear su formulario + registrarlo en el mapa.
No modificar SelectorServiciosDinamicos ni ClaseAbstractaForm.

**L — Sustitución de Liskov**
Los formularios de bloque extienden ClaseAbstractaForm sin romper su contrato.

**I — Segregación de interfaces**
SelectorServiciosDinamicos no necesita saber de modos ni lógica de guardado.
FormularioBloqueComponent no sabe cómo funciona cada formulario hijo.

**D — Inversión de dependencias**
Los componentes dependen de servicios inyectados, no de implementaciones concretas.

## Factores de calidad — Checklist antes de entregar código

Verifica siempre estos factores antes de proponer cualquier implementación o fix:

- **Correcto** — Cumple con exactitud los requerimientos técnicos y de negocio esperados.
- **Eficiente** — Mejor tiempo de respuesta, carga optimizada y uso adecuado de recursos.
- **Fiable** — No falla de forma inesperada; maneja los errores correctamente y mantiene sus funciones siempre.
- **Íntegro** — Garantiza la coherencia de los datos, realizando validaciones y previniendo estados corruptos o inválidos.
- **Fácil de uso** — Provee una experiencia intuitiva para el usuario final, ocultando cualquier complejidad técnica subyacente.
- **Mantenible** — Código limpio, con nomenclatura clara en español, fácil de comprender y de modificar a futuro.
- **Escalable** — Diseñado para crecer; agregar nueva funcionalidad (como un formato o bloque nuevo) implica poco esfuerzo y mínima modificación de código existente.

## Convenciones del proyecto

- **Idioma del código:** español (nombres de variables, métodos, clases, comentarios).
- **Idioma de errores al usuario:** español.
- **NestJS:** módulos separados por dominio; cada módulo tiene `module`, `resolver`, `service`, `entity`, `dto`.
- **GraphQL:** code-first con decoradores de NestJS.