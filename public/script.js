const socket = new WebSocket("wss://" + location.host);

socket.onopen = () => {
  document.getElementById("status").textContent = "Conectado ao servidor!";
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.event === "player_sync") {
    const table = document.getElementById("playerTable");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    for (const p of data.content) {
      const row = document.createElement("tr");

      const name = document.createElement("td");
      name.textContent = p.name || "(sem nome)";
      row.appendChild(name);

      const team = document.createElement("td");
      team.textContent = p.team || "-";
      team.className = p.team === "red" ? "team-red"
                        : p.team === "blue" ? "team-blue"
                        : "";
      row.appendChild(team);

      const state = document.createElement("td");
      state.textContent = p.state;
      state.className = p.state === "alive" ? "alive" : "death";
      row.appendChild(state);

      const life = document.createElement("td");
      life.textContent = p.life;
      row.appendChild(life);

      tbody.appendChild(row);
    }

    table.hidden = false;
    document.getElementById("status").textContent = 
      `Jogadores conectados: ${data.content.length}`;
  }
};

socket.onerror = () => {
  document.getElementById("status").textContent = "Erro de conexão.";
};

socket.onclose = () => {
  document.getElementById("status").textContent = "Desconectado do servidor.";
};
