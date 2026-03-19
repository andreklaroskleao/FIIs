rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function usuarioAutenticado() {
      return request.auth != null;
    }

    function ehDonoDoRecursoExistente() {
      return usuarioAutenticado() && resource.data.uid == request.auth.uid;
    }

    function ehDonoDoNovoRecurso() {
      return usuarioAutenticado() && request.resource.data.uid == request.auth.uid;
    }

    match /ativos/{documentoId} {
      allow read: if ehDonoDoRecursoExistente();
      allow create: if ehDonoDoNovoRecurso();
      allow update: if ehDonoDoRecursoExistente() && request.resource.data.uid == resource.data.uid;
      allow delete: if ehDonoDoRecursoExistente();
    }

    match /proventos/{documentoId} {
      allow read: if ehDonoDoRecursoExistente();
      allow create: if ehDonoDoNovoRecurso();
      allow update: if ehDonoDoRecursoExistente() && request.resource.data.uid == resource.data.uid;
      allow delete: if ehDonoDoRecursoExistente();
    }

    match /aportes/{documentoId} {
      allow read: if ehDonoDoRecursoExistente();
      allow create: if ehDonoDoNovoRecurso();
      allow update: if ehDonoDoRecursoExistente() && request.resource.data.uid == resource.data.uid;
      allow delete: if ehDonoDoRecursoExistente();
    }
  }
}