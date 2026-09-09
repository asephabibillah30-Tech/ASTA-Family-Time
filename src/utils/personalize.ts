import type { Card, Player } from '../types/game';

/**
 * Dynamically personalizes card challenges based on the current player's role/name
 * and assigns a target family member (e.g., if Ayah is playing -> asks about Ibu or Anak).
 */
export function personalizeCard(card: Card, currentPlayer: Player, allPlayers: Player[]): Card {
  // Find other players in the session
  const otherPlayers = allPlayers.filter(p => p.id !== currentPlayer.id);
  if (otherPlayers.length === 0) return card;

  // Pick a target player (e.g. if Ayah plays, pick Ibu or Anak)
  // If currentPlayer is Ayah and Ibu is in the game, prioritize Ibu or Anak
  let target = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];

  // If specific role matching
  const currentLower = (currentPlayer.rolePreset || currentPlayer.name).toLowerCase();

  let newTitle = card.title;
  let newDescription = card.description;
  let newProTip = card.proTip;

  // Specific role-swapping for Affection & Family cards:
  if (card.id === 39) {
    // Original: "Hal Paling Keren dari Ayah"
    if (currentLower.includes('ayah') || currentLower.includes('bapak') || currentLower.includes('papa')) {
      const spouseOrChild = otherPlayers.find(p => (p.rolePreset || p.name).toLowerCase().includes('ibu') || (p.rolePreset || p.name).toLowerCase().includes('mama')) || target;
      target = spouseOrChild;
      newTitle = `Hal Paling Keren dari ${target.name}`;
      newDescription = `Sebutkan satu hal atau kebiasaan ${target.name} yang paling ${currentPlayer.name} kagumi dan bikin bangga!`;
      newProTip = `Tatap ${target.name} dan ceritakan kehebatannya di depan seluruh keluarga!`;
    } else {
      const ayahPlayer = otherPlayers.find(p => (p.rolePreset || p.name).toLowerCase().includes('ayah') || (p.rolePreset || p.name).toLowerCase().includes('papa'));
      if (ayahPlayer) target = ayahPlayer;
      newTitle = `Hal Paling Keren dari ${target.name}`;
      newDescription = `Sebutkan satu hal atau kebiasaan ${target.name} yang paling kamu kagumi dan bikin bangga!`;
    }
  } else if (card.id === 40) {
    // Original: "Hal Paling Manis dari Ibu"
    if (currentLower.includes('ibu') || currentLower.includes('mama') || currentLower.includes('bunda')) {
      const spouseOrChild = otherPlayers.find(p => (p.rolePreset || p.name).toLowerCase().includes('ayah') || (p.rolePreset || p.name).toLowerCase().includes('papa')) || target;
      target = spouseOrChild;
      newTitle = `Hal Paling Manis dari ${target.name}`;
      newDescription = `Sebutkan satu perhatian, kebiasaan, atau kebaikan ${target.name} yang paling membuat hati ${currentPlayer.name} hangat!`;
      newProTip = `Ucapkan langsung ke arah ${target.name} dengan senyuman termanis!`;
    } else {
      const ibuPlayer = otherPlayers.find(p => (p.rolePreset || p.name).toLowerCase().includes('ibu') || (p.rolePreset || p.name).toLowerCase().includes('mama'));
      if (ibuPlayer) target = ibuPlayer;
      newTitle = `Hal Paling Manis dari ${target.name}`;
      newDescription = `Sebutkan satu masakan, nasehat, atau perhatian ${target.name} yang paling membuat hatimu hangat!`;
    }
  } else if (card.id === 38) {
    // "Peluk Hangat Sebelahmu!"
    newTitle = `Peluk Hangat ${target.name}!`;
    newDescription = `Berikan pelukan hangat dan senyuman termanis spesial untuk ${target.name} (${target.avatar})!`;
    newProTip = `Tepuk punggung ${target.name} perlahan dan katakan "Sayang ${target.name}!"`;
  } else if (card.id === 42) {
    // "Ucapkan Terima Kasih Tulus"
    newTitle = `Terima Kasih Tulus untuk ${target.name}`;
    newDescription = `Tatap mata ${target.name} (${target.avatar}), dan ucapkan terima kasih tulus atas bantuan atau kebaikannya selama ini!`;
    newProTip = `Sebutkan satu hal spesifik yang pernah ${target.name} lakukan untukmu.`;
  } else if (card.id === 43) {
    // "Ciptakan Tos Keluarga Baru!"
    newTitle = `Tos Rahasia Bareng ${target.name}`;
    newDescription = `Ajak ${target.name} (${target.avatar}) untuk menciptakan satu gerakan tos/high-five rahasia berdua yang kompak!`;
  } else if (card.id === 48) {
    // "Pantun Keluarga Ceria!"
    newTitle = `Pantun Ceria untuk ${target.name}`;
    newDescription = `Buat pantun kilat 2 atau 4 baris yang lucu dan ditujukan spesial untuk ${target.name}!`;
  } else if (card.id === 49) {
    // "Nama Superhero Keluarga!"
    newTitle = `Julukan Superhero ${target.name}!`;
    newDescription = `Beri julukan superhero unik beserta kekuatan super terhebat untuk ${target.name} (${target.avatar})!`;
  } else if (card.category === 'charades') {
    // Tebak gaya: sebutkan keluarga/target
    newDescription = `${card.description} (Ajak ${target.name} dan keluarga lainnya untuk menebak!)`;
  } else if (card.category === 'word_guess') {
    // Tebak kata
    newDescription = `${card.description} (Biarkan ${target.name} dan keluarga menebaknya!)`;
  }

  return {
    ...card,
    title: newTitle,
    description: newDescription,
    proTip: newProTip,
  };
}
