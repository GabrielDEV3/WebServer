const statusEl = document.getElementById("status");
const table = document.getElementById("playerTable");
const tbody = table.querySelector("tbody");

const host = window.location.host;

let socket;

function conectar() {
  socket = new WebSocket("wss://" + host);

  socket.onopen = () => {
    statusEl.textContent = `Conectado ao servidor: ${host}`;
    table.hidden = false;
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.event === "player_sync") {
        const players = data.content || [];

        tbody.innerHTML = "";

        if (players.length === 0) {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 5;
          td.textContent = "Nenhum jogador conectado";
          td.style.textAlign = "center";
          tr.appendChild(td);
          tbody.appendChild(tr);
        } else {
          players.forEach(player => {
            const tr = document.createElement("tr");

            const nome = document.createElement("td");
            nome.textContent = player.name || "Sem nome";
            tr.appendChild(nome);

            const time = document.createElement("td");
            time.textContent = player.team || "Indefinido";
            time.className = player.team === "red" ? "team-red" : player.team === "blue" ? "team-blue" : "";
            tr.appendChild(time);

            const estado = document.createElement("td");
            estado.textContent = player.state || "Desconhecido";
            estado.className = player.state === "alive" ? "alive" : "death";
            tr.appendChild(estado);

            const vida = document.createElement("td");
            vida.textContent = player.life ?? "N/A";
            tr.appendChild(vida);

            const lifeBar = document.createElement("td");
            const outer = document.createElement("div");
            outer.className = "life-bar";
            const inner = document.createElement("div");
            inner.className = "life-bar-inner";
            inner.style.width = `${Math.max(0, Math.min(100, player.life))}%`;
            if (player.life <= 30) inner.style.backgroundColor = "red";
            else if (player.life <= 60) inner.style.backgroundColor = "orange";
            else inner.style.backgroundColor = "limegreen";
            outer.appendChild(inner);
            lifeBar.appendChild(outer);
            tr.appendChild(lifeBar);

            tbody.appendChild(tr);
          });
        }
      }
    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
  };

  socket.onclose = () => {
    statusEl.textContent = `Desconectado do servidor: ${host}. Tentando reconectar...`;
    table.hidden = true;
    setTimeout(conectar, 3000);
  };

  socket.onerror = () => {
    statusEl.textContent = `Erro na conexão com o servidor: ${host}.`;
  };
}

conectar();
