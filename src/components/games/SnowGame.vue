<template>
  <div class="snow-game" @click="handleClick" ref="gameArea">
    <div class="score-board">
      <span>得分: {{ score }}</span>
      <span>时间: {{ timeLeft }}s</span>
    </div>
    <div
      v-for="snowflake in snowflakes"
      :key="snowflake.id"
      class="snowflake"
      :style="{
        left: snowflake.x + 'px',
        top: snowflake.y + 'px',
        fontSize: snowflake.size + 'px',
        opacity: snowflake.opacity
      }"
      @click.stop="catchSnowflake(snowflake)"
    >
      ❄️
    </div>
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="{
        left: particle.x + 'px',
        top: particle.y + 'px',
        '--tx': particle.tx + 'px',
        '--ty': particle.ty + 'px'
      }"
    ></div>
    <div v-if="gameOver" class="game-over">
      <h2>游戏结束！</h2>
      <p>最终得分: {{ score }}</p>
      <button class="btn btn-primary" @click="restart">再来一次</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'SnowGame',
  emits: ['score'],
  setup(props, { emit }) {
    const score = ref(0);
    const timeLeft = ref(30);
    const snowflakes = ref([]);
    const particles = ref([]);
    const gameOver = ref(false);
    const gameArea = ref(null);

    let gameInterval = null;
    let timerInterval = null;
    let snowflakeId = 0;
    let particleId = 0;

    const gameWidth = ref(400);
    const gameHeight = ref(600);

    onMounted(() => {
      if (gameArea.value) {
        gameWidth.value = gameArea.value.offsetWidth;
        gameHeight.value = gameArea.value.offsetHeight;
      }
      startGame();
    });

    onUnmounted(() => {
      clearInterval(gameInterval);
      clearInterval(timerInterval);
    });

    const startGame = () => {
      score.value = 0;
      timeLeft.value = 30;
      snowflakes.value = [];
      particles.value = [];
      gameOver.value = false;

      timerInterval = setInterval(() => {
        timeLeft.value--;
        if (timeLeft.value <= 0) {
          endGame();
        }
      }, 1000);

      gameInterval = setInterval(() => {
        if (!gameOver.value) {
          spawnSnowflake();
        }
      }, 400);
    };

    const spawnSnowflake = () => {
      const snowflake = {
        id: snowflakeId++,
        x: Math.random() * (gameWidth.value - 30),
        y: -20,
        size: 20 + Math.random() * 20,
        speed: 2 + Math.random() * 3,
        opacity: 0.7 + Math.random() * 0.3
      };
      snowflakes.value.push(snowflake);

      const fallInterval = setInterval(() => {
        if (gameOver.value) {
          clearInterval(fallInterval);
          return;
        }
        snowflake.y += snowflake.speed;
        if (snowflake.y > gameHeight.value) {
          clearInterval(fallInterval);
          snowflakes.value = snowflakes.value.filter(s => s.id !== snowflake.id);
        }
      }, 30);
    };

    const catchSnowflake = (snowflake) => {
      score.value += 10;

      for (let i = 0; i < 8; i++) {
        const particle = {
          id: particleId++,
          x: snowflake.x + snowflake.size / 2,
          y: snowflake.y + snowflake.size / 2,
          tx: (Math.random() - 0.5) * 100,
          ty: (Math.random() - 0.5) * 100
        };
        particles.value.push(particle);
        setTimeout(() => {
          particles.value = particles.value.filter(p => p.id !== particle.id);
        }, 500);
      }

      snowflakes.value = snowflakes.value.filter(s => s.id !== snowflake.id);
    };

    const endGame = () => {
      gameOver.value = true;
      clearInterval(gameInterval);
      clearInterval(timerInterval);
      emit('score', score.value);
    };

    const restart = () => {
      startGame();
    };

    const handleClick = () => {
    };

    return {
      score,
      timeLeft,
      snowflakes,
      particles,
      gameOver,
      gameArea,
      catchSnowflake,
      restart,
      handleClick
    };
  }
};
</script>

<style scoped>
.snow-game {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%);
  overflow: hidden;
  cursor: crosshair;
}

.score-board {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 18px;
  z-index: 10;
}

.snowflake {
  position: absolute;
  cursor: pointer;
  user-select: none;
  animation: rotate 3s linear infinite;
  transition: transform 0.1s;
}

.snowflake:hover {
  transform: scale(1.2);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  animation: explode 0.5s ease-out forwards;
}

@keyframes explode {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  z-index: 100;
}

.game-over h2 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
}

.game-over p {
  font-size: 18px;
  margin-bottom: 20px;
  color: #666;
}
</style>
