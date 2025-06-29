<template>
  <div v-if="show" class="modal-overlay" @click="$emit('cancel')">
    <div class="delete-modal" @click.stop>
      <div class="delete-icon">🗑️</div>
      <div class="modal-content">
        <h3 class="modal-title">Buch löschen?</h3>
        <p class="modal-description">
          Bist du sicher, dass du dieses Buch löschen möchtest? 
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('cancel')">
          ❌ Abbrechen
        </button>
        <button class="btn-delete" @click="$emit('confirm')">
          🗑️ Löschen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.delete-modal {
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(220, 53, 69, 0.2);
}

.delete-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(220, 53, 69, 0.5));
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.modal-content {
  margin-bottom: 2rem;
}

.modal-title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.modal-description {
  color: #ccc;
  font-size: 1rem;
  line-height: 1.4;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel, .btn-delete {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  min-width: 120px;
}

.btn-cancel {
  background: rgba(30, 30, 30, 0.8);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-cancel:hover {
  background: rgba(50, 50, 50, 0.9);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.btn-delete {
  background: rgba(220, 53, 69, 0.8);
  color: white;
  border: 1px solid rgba(220, 53, 69, 1);
  box-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
}

.btn-delete:hover {
  background: rgba(220, 53, 69, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
}

@media (max-width: 768px) {
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-delete {
    width: 100%;
  }
}
</style>