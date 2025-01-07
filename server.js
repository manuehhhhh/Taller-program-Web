// import { Deno } from "https://deno.land/std/http/mod.ts"; 
// import juego from juego.js;
// import jugador from jugador.js;
// import pieza from pieza.js;

// Me rendi tratando de importar XD

class Juego{
  id;
  jugadores;
  iniciado;
  constructor(id, jugadores){
      this.id = id;
      this.jugadores = [];
      this.jugadores.push(new jugador(jugadores));
      this.iniciado = false;
  }

  disparar(jugadorAtacado, posicionX, posicionY){
      for (const jugador of this.jugadores){
          if (jugador.nombre == jugadorAtacado){  
              jugador.perderCasilla(posicionX, posicionY);
          }
      }
  }

  ponerCasilla(jugadorAtacado, posicionX, posicionY, tipo){
    for (const jugador of this.jugadores){
        if (jugador.nombre == jugadorAtacado){  
            jugador.insertarcasilla(posicionX, posicionY, tipo);
        }
    }
}


  insertarNuevoJugador(nombre){
    this.jugadores.push(new jugador(nombre));
  }

  eliminarJugador(nombreEliminado){
    this.jugadores = this.jugadores.filter(nombre !== nombreEliminado);
}
}

class jugador{
  nombre;
  piezasrestantes;
  tablero;
  constructor(name){
      this.nombre = name;
      this.piezasrestantes = [];

      let tabla = [];
      let Aux = [];
      const tamano = 11
      for (let i = 0 ;i<11; i++ ) {
          for (let j = 0; j < 11; j++) {
              Aux.push(new casilla(i.toString() + "-" + j.toString()));
          }
          tabla.push(Aux);
          Aux = [];
      }
      this.tablero = tabla;
  }

  perderCasilla(posicionX, posicionY){
      tablero[posicionX][posicionY].tipo = 'disparado';
    }
  
  insertarcasilla(posicionX, posicionY, tipo){
    tablero[posicionX, posicionY].tipo = tipo;
  }
}

class casilla {
  posicion;
  tipo;
  constructor(posicion){
      this.posicion = posicion;
      this.tipo = 'agua';
  }
}

let juegos = [];
let maxId = 0

function manejarMensaje(mensaje, socket){
  switch (mensaje.type) {
    case 'create':
        crearJuego(socket, mensaje);
        break;
    case 'join':
        unirseJuego(socket, mensaje);
        break;
    case 'start':
        iniciarJuego(socket, mensaje);
        break;
    case 'move':
        realizarJugada(socket, mensaje);
        break;
    case 'leave':
        dejarJuego(socket, mensaje);
        break;
    case 'insertar':
        insertarPieza(socket, mensaje);
        break;
    default:
        // sendMessage(socket, { type: 'error', message: 'Unknown message type' });

}

}

function crearJuego(socket, mensaje){
  juegos.push(new Juego(maxId, mensaje.jugador));
  devolverJuego(socket, maxId);
  maxId++;
}

function unirseJuego(socket, mensaje){
  juegos[mensaje.id].insertarNuevoJugador(mensaje.jugador);
  devolverJuego(socket, mensaje.id);
}

function dejarJuego(socket, mensaje){
  juegos[mensaje.id].eliminarJugador(mensaje.jugador);
  devolverJuego(socket, mensaje.id);
}

function iniciarJuego(mensaje){
  juegos[mensaje.id].iniciado = true;
  devolverJuego(socket, mensaje.id);
}

function realizarJugada(socket, mensaje){
  juegos[mensaje.id].disparar(mensaje.jugada.jugador, mensaje.jugada.X, mensaje.jugada.Y);
  devolverJuego(socket, mensaje.id);
}

function devolverJuego(socket, id){
  socket.send(JSON.stringify(juegos[id]));
}

function insertarPieza(socket, mensaje){
  juegos[mensaje.id].insertarcasilla(mensaje.jugadorAtacado, posicionX, posicionY, mensaje.tipo);
}



Deno.serve(async (req) => {

  if (req.headers.get("upgrade") !== "websocket") {

    return new Response("Not a WebSocket request", { status: 400 });

  }



  const { socket, response } = Deno.upgradeWebSocket(req); 



  // Handle WebSocket events

  socket.onopen = () => console.log("Client connected");

  socket.onmessage = (event) => manejarMensaje(JSON.parse(event.data), socket);

  socket.onclose = () => console.log("Client disconnected");



  return response; 

}); 



console.log("Listening on http://localhost:8000");
