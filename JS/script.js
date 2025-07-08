
document.addEventListener("DOMContentLoaded", () => {
  const scenes = [
    { title: "🌿 Sendero", text: "Comienzas tu aventura...", boss: null },
    { title: "🦊 Zaruk", text: "Un zorro guardián te reta.", boss: { name: "Zaruk", hp: 35, item: "Flor del Alba", img:"image/zaruk.jpg" } },
    { title: "🌫️ Bosque Profundo", text: "La oscuridad murmura...", boss: { name: "Tharnak", hp: 50, item: "Raíz Silenciosa", img:"image/tharnak.jpg" } },
    { title: "🧮 Espejo del Alma", text: "Una ilusión surge...", boss: { name: "Zirel", hp: 70, item: "Lágrima Cristal", img:"image/zirel.jpg" } },
    { title: "💀 Último Eco", text: "El jefe final aparece...", boss: { name: "Volgor", hp: 100, item: "Alma Nocturna", img:"image/volgo.jpg" } },
    { title: "🌞 Amanecer", text: "La paz regresa al bosque.", boss: null }
  ];



  const sfx = {
    atk: document.getElementById("sfxAtk"),
    hit: document.getElementById("sfxHit"),
    esq: document.getElementById("sfxEsq"),
    bloq: document.getElementById("sfxBloq"),
    win: document.getElementById("sfxWin"),
    lose: document.getElementById("sfxLose")
  };
  const music = document.getElementById("musica");

  let state = {
    hp: 100,
    items: [],
    kills: 0,
    idx: 0,
    inBattle: false,
    bossHp: 0
  };

  const refs = {
    intro: document.getElementById("intro"),
    game: document.getElementById("juego"),
    hud: document.getElementById("hud"),
    fin: document.getElementById("fin"),
    title: document.getElementById("tituloEsc"),
    text: document.getElementById("textoEsc"),
    img: document.getElementById("imgEsc"),
    zone: document.getElementById("zonaCombate"),
    bossName: document.getElementById("bossName"),
    bossVida: document.getElementById("bossVida"),
    msgCombat: document.getElementById("msgCombate"),
    vidaHud: document.getElementById("vidaJugador"),
    msgHud: document.getElementById("msgHUD"),
    invList: document.getElementById("inventario"),
    btnAtk: document.getElementById("btnAtacar"),
    btnEsq: document.getElementById("btnEsquivar"),
    btnBloq: document.getElementById("btnBloquear"),
    btnNext: document.getElementById("btnNext"),
    btnStart: document.getElementById("btnStart"),
    msgFin: document.getElementById("msgFin"),
    resumen: document.getElementById("resumen"),
    btnRetry: document.getElementById("btnRetry"),
    progreso: document.getElementById("progreso"),
    barraProgreso: document.getElementById("barraProgreso")
  };

  refs.btnRetry.onclick = () => location.reload();
  refs.btnStart.onclick = iniciar;
  refs.btnNext.onclick = siguienteEscena;
  [refs.btnAtk, refs.btnEsq, refs.btnBloq].forEach(b => b.onclick = () => playerAct(b.id));

  function iniciar() {
    refs.intro.style.display = "none";
    refs.hud.style.display = "grid";
    refs.game.style.display = "block";
    refs.progreso.style.display = "block";
    music.volume = 0.1;
    music.play();
    loadScene();
  }

  function siguienteEscena() {
    state.idx++;
    state.inBattle = false;
    if (state.idx < scenes.length) {
      loadScene();
    } else {
      end(true);
    }
  }

  function loadScene() {
    const sc = scenes[state.idx];
    refs.title.textContent = sc.title;
    refs.text.textContent = sc.text;

    refs.zone.style.display = "none";
    refs.btnNext.style.display = "none";

    if (sc.boss) {
      startBattle(sc.boss);
    } else {
      refs.msgHud.textContent = "Presiona siguiente para continuar.";
      refs.btnNext.style.display = "inline-block";
    }

    updateHud();
    updateInv();
    updateProgress();
  }

  function startBattle(boss) {
    const imgBoss = document.getElementById("imgBoss");
    if (boss.img) {
      imgBoss.src = boss.img;
      imgBoss.style.display = "block";
    } else {
      imgBoss.style.display = "none";
    }
    state.inBattle = true;
    state.bossHp = boss.hp;
    refs.bossVida.style.width = boss.hp + "%";
    refs.bossVida.textContent = boss.hp + "%";
    refs.zone.style.display = "block";
    refs.btnNext.style.display = "none";
    refs.msgHud.textContent = "¡Combate! Elige acción.";
    refs.msgCombat.textContent = "";
    enableActions(true);
  }

  function enableActions(on) {
    [refs.btnAtk, refs.btnEsq, refs.btnBloq].forEach(b => b.disabled = !on);
  }

  function playerAct(act) {
    if (!state.inBattle) return;
    enableActions(false);
    let msg = "", dmg = 0;

    if (act === "btnAtacar") {
      sfx.atk.play();
      dmg = Math.floor(Math.random() * 8) + 8;
      state.bossHp -= dmg;
      msg = `Le haces ${dmg} daño.`;
    } else if (act === "btnEsquivar") {
      sfx.esq.play();
      msg = (Math.random() < 0.6) ? "Esquivaste el ataque." : "Erraste la esquiva.";
    } else {
      sfx.bloq.play();
      msg = "Bloqueaste parcialmente.";
    }

    refs.msgCombat.textContent = msg;
    refs.msgHud.textContent = "Turno enemigo...";
    setTimeout(enemyAct, 800);
  }

  function enemyAct() {
    let dmg = Math.floor(Math.random() * 7) + 5;
    const last = refs.msgCombat.textContent;

    if (last.includes("Esquivaste")) dmg = 0;
    else if (last.includes("Bloqueaste")) dmg = Math.floor(dmg / 2);

    if (dmg > 0) {
      sfx.hit.play();
      state.hp -= dmg;
      refs.msgHud.textContent = `Recibes ${dmg} de daño.`;
    } else {
      refs.msgHud.textContent = "Sin daño recibido.";
    }

    if (state.hp <= 0) return end(false);

    if (state.bossHp > 0) {
      refs.bossVida.style.width = state.bossHp + "%";
      refs.bossVida.textContent = state.bossHp + "%";
      enableActions(true);
      refs.msgHud.textContent = "Tu turno";
    } else {
      winBattle();
    }

    updateHud();
  }

  function winBattle() {
    sfx.win.play();
    state.inBattle = false;
    state.kills++;
    const item = scenes[state.idx].boss.item;
    state.items.push(item);
    state.hp = 100;
    refs.msgHud.textContent = `¡Has vencido! Obtuviste: ${item} y recuperaste tu vida.`;
    refs.zone.style.display = "none";
    refs.btnNext.style.display = "inline-block";
    updateInv();
    updateHud();
    updateProgress();
  }

  function updateHud() {
    if (state.hp < 0) state.hp = 0;
    refs.vidaHud.style.width = state.hp + "%";
    refs.vidaHud.textContent = state.hp + "%";
  }

  function updateInv() {
    refs.invList.innerHTML = "";
    state.items.forEach(x => {
      let li = document.createElement("li");
      li.textContent = x;
      refs.invList.appendChild(li);
    });
  }

  function updateProgress() {
    refs.barraProgreso.textContent = `Progreso: ${state.kills}/5`;
  }

  function end(win) {
    refs.game.style.display = "none";
    refs.hud.style.display = "none";
    refs.fin.style.display = "block";
    refs.progreso.style.display = "none";

    if (win) {
      sfx.win.play();
      refs.msgFin.textContent = "🏆 ¡Has salvado el Bosque Místico!";
      refs.resumen.innerHTML = `<p>Vida: ${state.hp}%</p><p>Guardianes vencidos: ${state.kills}</p><p>Ingredientes: ${state.items.join(", ")}</p>`;
    } else {
      sfx.lose.play();
      refs.msgFin.textContent = "💀 Has sido derrotado...";
      refs.resumen.innerHTML = "";
    }
  }
});
