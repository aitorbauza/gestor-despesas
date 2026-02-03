# Gestió de Despeses - React + Firebase

Aplicació web per a la gestió de projectes i despeses utilitzant **React** com a frontend i **Firebase** com a backend. Permet registrar usuaris, crear projectes, afegir participants i despeses, i veure un resum dels saldos de cada participant.

---

## Objectiu

L'objectiu d'aquest projecte és:

- Gestionar **projectes** i **participants**.
- Afegir **despeses** amb informació completa:
  - Concepte
  - Quantia
  - Qui ha pagat
  - Divisió entre participants
- Mostrar un **panell de resum** amb el total de despeses i els saldos individuals.
- Utilitzar **Firebase Auth** per a l'autenticació i **Firestore** per a l'emmagatzematge de dades.

---

## Tecnologies utilitzades

- **Front-end:** React (Vite)
- **Routing:** React Router
- **Back-end / BBDD:** Firebase
  - Firebase Auth (autenticació)
  - Firestore (emmagatzematge de projectes, participants i despeses)
- **Altres eines:**
  - ESLint / Prettier per estil de codi

---

## Funcionalitats

### Autenticació

- Registre i inici de sessió amb **Firebase Auth**
- Rutes protegides on només els usuaris autenticats poden accedir als projectes

### Gestió de projectes

- Crear, editar i eliminar projectes
- Afegir participants (amb o sense compte Firebase)
- L'usuari que crea el projecte és automàticament participant

### Gestió de despeses

- Crear despeses amb:
  - Concepte
  - Quantia
  - Pagat per (usuari autenticat per defecte)
  - Dividir entre (tots els participants per defecte)
- Editar i eliminar despeses
- Divisió de despeses flexible per participant

### Gestió de participants

- Crear, editar i eliminar participants
- Actualització automàtica de les despeses en què participen

### Panell de resum

- Total de despeses per projecte
- Quantitat que cada participant deu o ha de rebre segons la divisió de les despeses

---

## Instal·lació i execució

- Clonar el repositori:


git clone https://github.com/aitorbauza/gestor-despesas.git

cd gestio-despeses

- Seguir el document "manual_integració.pdf".