import { SampleImage } from '../types';

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'landscape-1',
    title: '静かな湖と山並み',
    category: '風景・自然',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    description: '空や湖面に雲・ボート・虹などを追加、あるいは手前の要素を削除するテストに最適です。',
    suggestedPrompt: '空に鮮やかなダブルレインボー（二重の虹）を追加して',
  },
  {
    id: 'room-1',
    title: 'モダンなリビングルーム',
    category: 'インテリア',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
    description: '壁の絵画、クッションの色、観葉植物、卓上小物の変更・追加・消去のテストに最適です。',
    suggestedPrompt: 'ソファの上のクッションの色を鮮やかなターコイズブルーに変更して',
  },
  {
    id: 'coffee-1',
    title: 'カフェのデスク＆コーヒー',
    category: '静物・ライフスタイル',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
    description: 'カップ、ノート、ペン、植物の置換や背景小物の修正に最適です。',
    suggestedPrompt: 'コーヒーカップの横に美味しそうなクロワッサンを追加して',
  },
  {
    id: 'cat-1',
    title: '日なたの猫',
    category: 'ペット・動物',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80',
    description: '首輪の着用、毛色の部分修正、背景の模様替えなどのテストに最適です。',
    suggestedPrompt: '猫の首に赤いリボンタイを付け加えて',
  },
];
