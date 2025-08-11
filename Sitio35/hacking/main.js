(() => {
  const pantalla = document.getElementById("pantalla");
  const form = document.getElementById("comandoForm");
  const input = document.getElementById("comandoInput");
  const overlay = document.getElementById("minijuegoOverlay");
  const canvas = document.getElementById("juegoCanvas");
  const ctx = canvas.getContext("2d");
  const cerrarBtn = document.getElementById("cerrarMinijuego");

  let nivelAutorizacion = 4;
  let jugando = false;

  const archivos = {
    "anomalias.dat": "https://www.example.com/anomalias.pdf",
    "protocolo_sombra.exe": "https://www.example.com/protocolo_sombra.pdf",
    "bio-agentes.sys": "https://www.example.com/bio-agentes.pdf",
  };

  function appendTexto(texto) {
    pantalla.innerText += "\n" + texto;
    pantalla.scrollTop = pantalla.scrollHeight;
  }

  function appendUsuario(texto) {
    pantalla.innerHTML += `\n<span class="input">&gt; ${texto}</span>`;
    pantalla.scrollTop = pantalla.scrollHeight;
  }

  function ejecutarComando(comando) {
    const c = comando.toLowerCase().trim();

    if (jugando) {
      appendTexto("¡Termina el minijuego primero!");
      return;
    }

    switch (true) {
      case c === "help":
        appendTexto(
          "Comandos disponibles: help, override, listar, abrir_archivo, salir"
        );
        break;

      case c === "listar":
        appendTexto(
          "Archivos disponibles: " + Object.keys(archivos).join(", ")
        );
        break;

      case c.startsWith("abrir_archivo"):
        if (nivelAutorizacion < 5) {
          appendTexto("Acceso denegado. Nivel de autorización insuficiente.");
          return;
        }
        const partes = comando.split(" ");
        if (partes.length < 2) {
          appendTexto("Uso: abrir_archivo <nombre_del_archivo>");
          return;
        }
        const archivo = partes.slice(1).join(" ");
        if (archivo in archivos) {
          appendTexto(`Abriendo archivo: ${archivo}...`);
          window.open(archivos[archivo], "_blank");
        } else {
          appendTexto("Archivo no encontrado o sin permiso para abrir.");
        }
        break;

      case c === "override":
        iniciarOverride();
        break;

      case c === "salir":
        appendTexto("Conexión finalizada. Cerrando terminal...");
        input.disabled = true;
        break;

      default:
        appendTexto(
          "Comando no reconocido. Usa 'help' para ver los comandos disponibles."
        );
    }
  }

  // Secuencia de acceso override
  function iniciarOverride() {
    appendTexto("Iniciando procedimiento Override para acceso nivel 5...");
    appendTexto("Accediendo a la base de datos...");
    setTimeout(() => {
      appendTexto("Firewall detectado...");
      setTimeout(() => {
        appendTexto("Desactivando firewall...");
        setTimeout(() => {
          iniciarMinijuego();
        }, 1000);
      }, 1500);
    }, 1500);
  }

  // --------- MINIJUEGO PONG ---------
  const juego = {
    ancho: canvas.width,
    alto: canvas.height,
    barra: {
      ancho: 100,
      alto: 15,
      x: 0,
      y: 0,
      velocidad: 7,
    },
    pelota: {
      x: 0,
      y: 0,
      radio: 10,
      dx: 5,
      dy: -5,
    },
    rebotes: 0,
    maxRebotes: 30,
    fallos: 0,
    maxFallos: 3,
    tiempoTotal: 30000,
    tiempoInicio: 0,
    jugando: false,
    teclas: {
      izquierda: false,
      derecha: false,
    },
  };

  function resetJuego() {
    juego.barra.x = (juego.ancho - juego.barra.ancho) / 2;
    juego.barra.y = juego.alto - juego.barra.alto - 20;
    juego.pelota.x = juego.ancho / 2;
    juego.pelota.y = juego.alto / 2;
    juego.pelota.dx = 5 * (Math.random() < 0.5 ? 1 : -1);
    juego.pelota.dy = -5;
    juego.rebotes = 0;
    juego.fallos = 0;
    juego.jugando = true;
    juego.tiempoInicio = performance.now();
  }

  function dibujarRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function dibujarCirculo(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function dibujarTexto(texto, x, y, color, size = "20px") {
    ctx.fillStyle = color;
    ctx.font = `${size} 'Courier New', monospace`;
    ctx.fillText(texto, x, y);
  }

  function actualizarJuego() {
    if (!juego.jugando) return;

    const ahora = performance.now();
    const tiempoPasado = ahora - juego.tiempoInicio;
    const porcentajeTiempo = Math.max(
      0,
      100 - (tiempoPasado / juego.tiempoTotal) * 100
    );

    // Movimiento barra
    if (juego.teclas.izquierda)
      juego.barra.x = Math.max(0, juego.barra.x - juego.barra.velocidad);
    if (juego.teclas.derecha)
      juego.barra.x = Math.min(
        juego.ancho - juego.barra.ancho,
        juego.barra.x + juego.barra.velocidad
      );

    // Movimiento pelota
    juego.pelota.x += juego.pelota.dx;
    juego.pelota.y += juego.pelota.dy;

    // Rebote lateral
    if (
      juego.pelota.x + juego.pelota.radio > juego.ancho ||
      juego.pelota.x - juego.pelota.radio < 0
    )
      juego.pelota.dx = -juego.pelota.dx;

    // Rebote superior
    if (juego.pelota.y - juego.pelota.radio < 0)
      juego.pelota.dy = -juego.pelota.dy;

    // Rebote barra
    if (
      juego.pelota.y + juego.pelota.radio > juego.barra.y &&
      juego.pelota.x > juego.barra.x &&
      juego.pelota.x < juego.barra.x + juego.barra.ancho
    ) {
      juego.pelota.dy = -juego.pelota.dy;
      juego.rebotes++;
      if (Math.abs(juego.pelota.dx) < 10) {
        juego.pelota.dx *= 1.05;
        juego.pelota.dy *= 1.05;
      }
    }

    // Fallo
    if (juego.pelota.y - juego.pelota.radio > juego.alto) {
      juego.fallos++;
      resetPosicionPelota();
      if (juego.fallos >= juego.maxFallos) {
        terminarJuego(false);
        return;
      }
    }

    // Condiciones de victoria
    if (porcentajeTiempo <= 0 || juego.rebotes >= juego.maxRebotes) {
      terminarJuego(true);
      return;
    }

    // Dibujar escena
    ctx.clearRect(0, 0, juego.ancho, juego.alto);
    dibujarRect(0, 0, juego.ancho, juego.alto, "#000");
    dibujarRect(
      juego.barra.x,
      juego.barra.y,
      juego.barra.ancho,
      juego.barra.alto,
      "#0f0"
    );
    dibujarCirculo(juego.pelota.x, juego.pelota.y, juego.pelota.radio, "#0f0");
    dibujarTexto(
      `Tiempo restante: ${porcentajeTiempo.toFixed(0)}%`,
      10,
      30,
      "#0f0",
      "18px"
    );
    dibujarTexto(
      `Fallos: ${juego.fallos} / ${juego.maxFallos}`,
      10,
      55,
      "#0f0",
      "18px"
    );
    dibujarTexto(
      `Rebotes: ${juego.rebotes} / ${juego.maxRebotes}`,
      10,
      80,
      "#0f0",
      "18px"
    );

    requestAnimationFrame(actualizarJuego);
  }

  function resetPosicionPelota() {
    juego.pelota.x = juego.ancho / 2;
    juego.pelota.y = juego.alto / 2;
    juego.pelota.dx = 5 * (Math.random() < 0.5 ? 1 : -1);
    juego.pelota.dy = -5;
  }

  function terminarJuego(ganado) {
    juego.jugando = false;
    if (ganado) {
      appendTexto("Firewall desactivado...");
      setTimeout(() => {
        appendTexto("Acceso concedido...");
        setTimeout(() => {
          appendTexto(
            "Nivel 5 otorgado. Ya puedes abrir archivos restringidos."
          );
          nivelAutorizacion = 5;
          ocultarMinijuego();
        }, 1000);
      }, 1000);
    } else {
      appendTexto("Acceso denegado. El Firewall ha detenido el override.");
      setTimeout(ocultarMinijuego, 1500);
    }
  }

  function iniciarMinijuego() {
    if (jugando) return;
    jugando = true;
    resetJuego();
    overlay.style.display = "flex";
    input.disabled = true;
    actualizarJuego();
  }

  function ocultarMinijuego() {
    jugando = false;
    overlay.style.display = "none";
    input.disabled = false;
    input.focus();
  }

  // Eventos teclado
  window.addEventListener("keydown", (e) => {
    if (!jugando) return;
    if (["ArrowLeft", "a"].includes(e.key.toLowerCase()))
      juego.teclas.izquierda = true;
    if (["ArrowRight", "d"].includes(e.key.toLowerCase()))
      juego.teclas.derecha = true;
  });

  window.addEventListener("keyup", (e) => {
    if (!jugando) return;
    if (["ArrowLeft", "a"].includes(e.key.toLowerCase()))
      juego.teclas.izquierda = false;
    if (["ArrowRight", "d"].includes(e.key.toLowerCase()))
      juego.teclas.derecha = false;
  });

  cerrarBtn.addEventListener("click", () => {
    if (jugando) {
      appendTexto("Debes terminar el minijuego para continuar.");
    } else {
      ocultarMinijuego();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const comando = input.value.trim();
    appendUsuario(comando);
    ejecutarComando(comando);
    input.value = "";
  });
})();
