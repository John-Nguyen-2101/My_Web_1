const quickText = `
[ĐIỆP KHÚC]
C|Cmaj7 : Mừng tết / đến {vạn lộc}
G|G7    : đến nhà / nhà {cánh mai}
Am      : vàng {cành đào} / hồng thắm
Em      : tươi /

F       : Chúc cụ / già {được sống}
C       : lâu sống / khỏe {cùng con}
F       : Cháu sang / năm lại
G       : đón tết / sang

C       : Và kính / chúc {người người}
G       : sẽ gặp / lành {tết sau}
Am      : được {nhiều lộc} / hơn tết
Em      : nay /

F       : {tết đến} đoàn / tụ {cùng ở}
C       : bên bếp / hồng {và nồi}
F       : bánh chưng / xanh chờ
F       : xuân đang / sang

[VERSE]
C       : Cánh / én nơi
G       : nơi / khắp phố
`;

const songMeta = {
  id: "Ngayxuanlpxv",
  title: "Ngày xuân long phụng sum vầy",
  author: "Quang Huy",
  style: "Ballad",
  recommendedTempo: "60–80 BPM",
  bpm: 80,
  timeSigTop: 2,
  timeSigBottom: 4,
  meterMode: "simple",
  key: "C",
  scale: "major"
};

const songJson = buildSongFromQuickText(songMeta, quickText, {
  slotsPerBeat: 2,
  includeSpacerChord: true
});

console.log(songJson);