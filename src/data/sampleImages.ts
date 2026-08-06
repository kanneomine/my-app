import { SampleImage } from '../types';

import img5019 from '../assets/images/IMG_5019.jpeg';
import img4006 from '../assets/images/IMG_4006.jpeg';

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'house-interior-5019',
    title: 'ミニマルで温かみのある邸宅リビング',
    category: 'インテリア',
    url: img5019,
    description: '温かみのある木製家具とモダンなコンクリート床のリビングルーム。照明調節や家具の変更・追加に最適です。',
    suggestedPrompt: '中央のローテーブルの上に、おしゃれなガラスの花瓶と観葉植物を追加して',
  },
  {
    id: 'bathroom-interior-4006',
    title: 'ラグジュアリーな大理石バスルーム',
    category: 'インテリア',
    url: img4006,
    description: '美しい木目と大理石の壁、森林の光が差し込む上質な浴室。洗面ボウルやアメニティ、照明の調整に最適です。',
    suggestedPrompt: '右下にあるベージュのバスマットを、高級感のある白くふかふかなタオル地のバスマットに変更して',
  },
  {
    id: 'landscape-1',
    title: '静かな湖と山並み',
    category: '風景・自然',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    description: '空や湖面に雲・ボート・虹などを追加、あるいは手前の要素を削除するテストに最適です。',
    suggestedPrompt: '空に鮮やかなダブルレインボー（二重の虹）を追加して',
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
