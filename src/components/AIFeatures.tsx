import React, { useState } from 'react';
import { FarmState } from '../types';
import { translations } from '../utils/translations';
import { 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  Flame, 
  CloudSnow, 
  Stethoscope, 
  HeartPulse, 
  HelpCircle, 
  CornerDownRight, 
  AlertCircle,
  FileText,
  BadgeAlert,
  CalendarDays,
  Activity,
  ArrowRight
} from 'lucide-react';

interface AIProps {
  state: FarmState;
  lang: 'en' | 'ne';
}

// Highly comprehensive offline veterinary knowledge base matching Chitwan, Nepal local clinic standards.
interface OfflineDiseaseData {
  id: string;
  category: 'Poultry' | 'Fish' | 'Goats' | 'Pigeons';
  symptomKey: string;
  labelEn: string;
  labelNe: string;
  diseaseEn: string;
  diseaseNe: string;
  remedyEn: string;
  remedyNe: string;
  preventionEn: string;
  preventionNe: string;
  organicEn: string;
  organicNe: string;
  urgency: 'HIGH ALERT' | 'MEDIUM CARE' | 'ISOLATION REQUIRED';
}

const offlineKnowledgeBase: OfflineDiseaseData[] = [
  {
    id: "poultry_red_diarrhea",
    category: "Poultry",
    symptomKey: "red_diarrhea",
    labelEn: "Broilers/Chicks with Red/Bloody Diarrhea and ruffled feathers",
    labelNe: "रातो/रगत बग्ने छेर्ने (डायरिय) समस्या भएको ब्रोइलर वा चल्लाहरू",
    diseaseEn: "Coccidiosis (Eimeria protozoan parasite infection of gut)",
    diseaseNe: "कक्सिडियोसिस (रगतमासी रोग - आन्द्राको परजीवी संक्रमण)",
    remedyEn: "Administer Amprolium Soluble Powder (e.g., Coxiprol) 1g per 2 Liters of fresh drinking water for 5 consecutive days. Alternatively, use Toltrazuril liquid (1ml per Liter) for 2 days.",
    remedyNe: "एम्प्रोलियम घुलनशील पाउडर (Coxiprol) १ ग्राम प्रति २ लिटर पिउने पानीमा मिसाएर लगातार ५ दिनसम्म दिनुहोस् वा टोलट्राजुरिल झोल औषधी (१ एमएल प्रति लिटर पानीमा) २ दिनसम्म चलाउनुहोस्।",
    preventionEn: "Keep chicken coop litter strictly bone-dry. Rake and replace damp sawdust instantly. Spray Virkon-S sanitizer (1:100 dilution) inside empty walkways.",
    preventionNe: "खोरको भुस (सोत्तर-Sawdust) संधै सुक्खा राख्नुहोस्। भिजेको सोत्तर तुरुन्तै फेर्नुहोस् र खोरमा भिरकोन-एस (Virkon-S) कीटाणुनाशक औषधि हप्ताको एक पटक छर्कनुहोस्।",
    organicEn: "Feed turmeric water (anti-inflammatory) and concentrated garlic paste mixed in lukewarm water to support immune response.",
    organicNe: "हल्दी पानी (एन्टी-इन्फ्लेमेटरी) र लसुनको लेदो मनतातो पानीमा मिसाएर खुवाउँदा चल्लाको रोग प्रतिरोधात्मक क्षमता बढ्छ र आन्द्रा निको हुन मद्दत गर्दछ।",
    urgency: "HIGH ALERT"
  },
  {
    id: "poultry_white_diarrhea",
    category: "Poultry",
    symptomKey: "white_diarrhea",
    labelEn: "Chicks with white watery/pasty diarrhea, pasting of vent, and huddling",
    labelNe: "सेतो र पानी जस्तो पातलो दिसा गर्ने, मलद्वार वरिपरि टाँसिने र चल्लाहरू थुप्रिने",
    diseaseEn: "Pullorum Disease (Salmonella pullorum bacteria) or Gumboro (IBD)",
    diseaseNe: "पुलोरम रोग (सेतो छेर्ने ब्याक्टेरियल संक्रमण) वा गम्बोरो रोग",
    remedyEn: "Provide broad-spectrum antibiotics such as Neomycin or Enrofloxacin drops (10% solution, 1ml per Liter of water) for 3-5 days. Ensure immediate multivitamin (Electrolytes/Jeevan Jal) application.",
    remedyNe: "एन्जरोफ्लोक्सासिन (Enrofloxacin) वा नियोमाइसिन झोल औषधि (१ एमएल प्रति लिटर पानीमा) लगातार ३ देखि ५ दिनसम्म दिनुहोस्। पानीमा जीवनजल वा इलेक्ट्रोलाइट्स अनिवार्य मिसाउनुहोस्।",
    preventionEn: "Source chicks from certified disease-free hatcheries. Ensure strict brooding sanitation and clean water filtration.",
    preventionNe: "रोगमुक्त प्रमाणित ह्याचरीबाट मात्र चल्ला खरिद गर्नुहोस्। ब्रुडिङ कोठा सधैं सफा र जैविक रूपमा सुरक्षित राख्नुहोस्।",
    organicEn: "Mix ginger infusion (helps empty crop) and probiotic curd whey (dahi ko pani) under fresh water to balance gut flora.",
    organicNe: "अदुवाको रस र प्राकृतिक मोही वा दहीको अमिलो पानी पिउने पानीमा मिसाएर दिनुहोस् जसले पेटको हानिकारक ब्याक्टेरिया नष्ट गर्छ।",
    urgency: "HIGH ALERT"
  },
  {
    id: "poultry_yellow_diarrhea",
    category: "Poultry",
    symptomKey: "yellow_diarrhea",
    labelEn: "Poultry showing yellowish-green runny diarrhea, high fever, and sudden mortality",
    labelNe: "पहेंलो-हरियो पातलो छेर्ने, कडा ज्वरो आउने र एक्कासी चल्ला मर्ने",
    diseaseEn: "Fowl Cholera or Newcastle Disease (Ranikhet Virus infection)",
    diseaseNe: "हेजारे (Fowl Cholera) वा रानीखेत रोग (Ranikhet Virus)",
    remedyEn: "For Fowl Cholera, prescribe Tetracycline or Tylosin powder. For Newcastle (virus), target supportive care using vitamins & respiratory bronchodilators, as there is no direct antiviral drug.",
    remedyNe: "हेजारे रोगका लागि टेट्रासाइक्लिन वा टाइलोसिन पाउडर दिनुहोस्। रानीखेत (Ranikhet) रोग भाइरस भएकाले यसको कुनै निश्चित उपचार छैन, त्यसैले मल्टिभिटामिन र इलेक्ट्रोलाइट्स दिएर बचाउनु पर्छ।",
    preventionEn: "Exclude wild birds and rodents from feed warehouses. Strictly implement Lasota vaccine on day 5-7, and booster on day 24-26.",
    preventionNe: "खोरमा जंगली चराचुरुङ्गी र मुसालाई पस्न नदिनुहोस्। चल्ला ५-७ दिनको हुँदा 'लासोता' खोप र २४-२६ दिनमा बुस्टर खोप अनिवार्य दिनुहोस्।",
    organicEn: "Administer neem leaf boiled extracts (natural antiviral and disinfectant properties) mixed in drinking water.",
    organicNe: "नीमको पात उमालेर तयार पारेको काँढापानी पिउने पानीमा मिसाएर हप्तामा दुई पटक दिनुहोस् जसमा प्राकृतिक भाइरस प्रतिरोधी क्षमता हुन्छ।",
    urgency: "HIGH ALERT"
  },
  {
    id: "goat_foot_rot",
    category: "Goats",
    symptomKey: "goat_limp",
    labelEn: "Goats limping, blisters between claws, rotting hoof walls, and foul smell",
    labelNe: "बाख्राहरू कुँजिएर हिंड्ने, खुरको बीचमा घाउ वा चिलाउने र खुर कुहिएर गन्ध आउने",
    diseaseEn: "Infectious Foot Rot (bacterial disease caused by Fusobacterium necrophorum)",
    diseaseNe: "खुर कुहिने रोग (Foot Rot - ब्याक्टेरियल संक्रमण)",
    remedyEn: "Trimming of overgrown hoof walls gently. Immerse the affected foot in a 5% Copper Sulphate (Nilo Tuti) or Zinc Sulphate footbath daily for 5 minutes. Apply OTC Terramycin violet spray.",
    remedyNe: "बाख्राको बढेको खुरलाई सफा चक्कु वा कटरले होसियारीपूर्वक काट्नुहोस्। प्रभावित खुरलाई ५% निलो तुती (Copper Sulphate) पानीको घोलमा दैनिक ५ मिनेट चोबाल्नुहोस् र टेरामाइसिन स्प्रे लगाउनुहोस्।",
    preventionEn: "Keep the goat house floor clean and free from wet mud. Prefer elevated wooden slatted floor housing structures.",
    preventionNe: "बाख्रा खोरमुनिको ओसिलो हिलो र मलमूत्र दैनिक सफा गर्नुहोस्। काठको उठेको टाँड (Slatted floor) प्रविधिको खोर प्रयोग गर्नुहोस्।",
    organicEn: "Wash hooves with warm saline water, then apply a thick paste of grounded raw turmeric and neem leaves.",
    organicNe: "तातो नुनपानीले खुर पखालिसकेपछि काँचो बेसार र नीमको पात पिँधेर बनाएको लेदो घाउमा टाँस्नुहोस्।",
    urgency: "MEDIUM CARE"
  },
  {
    id: "pigeon_pox",
    category: "Pigeons",
    symptomKey: "pigeon_blisters",
    labelEn: "Pigeons with crusty nodules/blisters on featherless areas around eyes, mouth, and feet",
    labelNe: "परेवाको आँखा, चुच्चो र खुट्टा वरिपरि पहेंलो र साह्रो डाबर/फोका (बिमिरा) हरू आउने",
    diseaseEn: "Avian Pigeon Pox Virus",
    diseaseNe: "परेवाको बिफर रोग (Pigeon Pox भाइरस)",
    remedyEn: "Isolate sick pigeons immediately. Treat crusty wounds topically with Gentian Violet or Betadine solution. Provide Vitamin A and C drop supplements in freshwater.",
    remedyNe: "बिरामी परेवालाई तत्काल छुट्टै खोरमा क्वारेन्टाइन गर्नुहोस्। फोकाहरूमा जेन्सियन भायोलेट (Gentian Violet) वा बेटाडिन मलम लगाउनुहोस्। पानीमा भिटामिन 'ए' र 'सी' थप्नुहोस्।",
    preventionEn: "Keep nesting areas free from mosquitoes (mosquito netting on cages). Thoroughly clean and disinfect feeding mugs.",
    preventionNe: "परेवा बस्ने ठाउँलाई लामखुट्टेबाट जोगाउन मसिनो जाली लगाउनुहोस्। चारो हाल्ने भाँडो दैनिक कीटाणुनाशक साबुन पानीले धुनुहोस्।",
    organicEn: "Boil holy basil (Tulsi) leaves and turmeric, filter, and make the flock drink the lukewarm herbal liquid.",
    organicNe: "तुलसीको पात र बेसार पानीमा उमालेर तयार पारेको काँढापानी मनतातो बनाएर परेवाहरूलाई पिउन दिनुहोस्।",
    urgency: "ISOLATION REQUIRED"
  },
  {
    id: "fish_gasping",
    category: "Fish",
    symptomKey: "fish_gasp",
    labelEn: "Tilapia/Carp swimming on pond surface gasping for air in early morning",
    labelNe: "बिहानपख पोखरीको माथिल्लो भागमा माछाहरू तैरिएर मुख चलाउँदै हावा निल्न खोज्ने",
    diseaseEn: "Dissolved Oxygen Depletion (Anoxia) from heavy organic loading or algal crash",
    diseaseNe: "पोखरीमा अक्सिजनको कमी (Dissolved Oxygen Depletion / Anoxia)",
    remedyEn: "Turn on paddle aerators immediately or create manual water splashing. Add oxygen-releasing tablets (e.g., OxyLife or OxyMax - 1kg per acre). Halt feeding immediately for 24 hours.",
    remedyNe: "तुरुन्तै पोखरीमा एरिएटर (Paddle aerators) चलाउनुहोस् वा काठको फल्याकले पानी फ्याँकेर हलचल गराउनुहोस्। अक्सिजन ट्याब्लेट (OxyMax) छर्कनुहोस् र २४ घण्टा चारो हाल्न पूर्ण रूपमा बन्द गर्नुहोस्।",
    preventionEn: "Avoid dumping excess feed that decays at the bottom. Periodically pump out stagnant bottom water and refill with tube well water.",
    preventionNe: "सडेर जाने बढी चारो पोखरीमा नहाल्नुहोस्। पोखरीको पिँधको दूषित पानी फाल्ने (Siphoning) र ताजा बोरिङको पानी भर्ने व्यवस्था गर्नुहोस्।",
    organicEn: "Perform 25-30% partial water exchange with fresh borehole water to quickly dilute carbon-dioxide concentrations.",
    organicNe: "हतारमा २५-३० प्रतिशत पुरानो पानी फालेर ताजा बोरिङ वा कलको पानी पोखरीमा भर्नुहोस् जसले प्रदूषण र कार्बनडाइअक्साइड घटाउँछ।",
    urgency: "HIGH ALERT"
  }
];

export function AIFeatures({ state, lang }: AIProps) {
  const t = translations[lang];

  // User Interactive Diagnostics States
  const [selectedCategory, setSelectedCategory] = useState<'Poultry' | 'Goats' | 'Fish' | 'Pigeons'>('Poultry');
  const [selectedSymptom, setSelectedSymptom] = useState<string>('red_diarrhea');
  const [customObservation, setCustomObservation] = useState('');
  const [currentSeason, setCurrentSeason] = useState<'summer' | 'winter'>('summer');

  // Diagnosis Execution State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticMode, setDiagnosticMode] = useState<'offline' | 'ai'>('offline');
  const [responseMarkdown, setResponseMarkdown] = useState<string | null>(null);
  const [offlineMatch, setOfflineMatch] = useState<OfflineDiseaseData | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Active Category Symptom lists builder
  const getSymptomOptions = (cat: 'Poultry' | 'Goats' | 'Fish' | 'Pigeons') => {
    switch (cat) {
      case 'Poultry':
        return [
          { key: 'red_diarrhea', en: 'Red or bloody watery stool / diarrhea', ne: 'रातो वा रगत मिश्रित पातलो छेर्ने समस्या' },
          { key: 'white_diarrhea', en: 'Creamy-white paste-like diarrhea / vent pasting', ne: 'मलद्वार टाँसिने सेतो पानी जस्तो छेर्ने समस्या' },
          { key: 'yellow_diarrhea', en: 'Yellowish-green diarrhea / high fever', ne: 'पहेंलो-हरियो पातलो दिसा र कडा ज्वरो' },
          { key: 'respiratory', en: 'Snoring sounds (Rales), swollen face & watery eyes', ne: 'नाकबाट पानी बग्ने, घुरघुर आवाज र अनुहार सुन्निने' },
        ];
      case 'Goats':
        return [
          { key: 'goat_limp', en: 'Hoof walls rotting, limping, foul odor', ne: 'खुर कुहिएर गन्ध आउने र कुँजिएर हिंड्ने' },
          { key: 'goat_fever', en: 'High fever, nasal discharge, dry snout coughing', ne: 'बाख्रालाई कडा ज्वरो आउने, सिंगान बग्ने र खोक्ने (PPR शंका)' },
          { key: 'goat_bloat', en: 'Swollen tight left flank stomach (Acid Bloat)', ne: 'पेटको देब्रे कोखा साह्रो भई फुल्ने र करकराहट हुने (बाडुली/पेट फुल्ने)' },
        ];
      case 'Fish':
        return [
          { key: 'fish_gasp', en: 'Floating flat or gasping air at early morning', ne: 'बिहानीपख माछाहरू जम्मा भई सतहमा मुख चलाइरहने (अक्सिजन अभाव)' },
          { key: 'fish_spots', en: 'Red lesions or white fungus patches on gills / skin', ne: 'गलफडा वा कत्ला सफा नभई सेतो भुवा जस्तो वा घाउ देखिने' },
        ];
      case 'Pigeons':
        return [
          { key: 'pigeon_blisters', en: 'Crusty nodules / blisters near eyes and nostrils', ne: 'परेवाको चुच्चो, आँखा निधारमा खटिरा जस्ता साह्रो डाबर आउने' },
          { key: 'pigeon_green', en: 'Watery bright green diarrhea / head shaking', ne: 'हरियो र पातलो पानी जस्तो छेर्ने, टाउको बटार्ने रानीखेत लक्षण' },
        ];
    }
  };

  // Switch category reset symptom
  const handleCategoryChange = (cat: 'Poultry' | 'Goats' | 'Fish' | 'Pigeons') => {
    setSelectedCategory(cat);
    const symptoms = getSymptomOptions(cat);
    setSelectedSymptom(symptoms[0].key);
    setResponseMarkdown(null);
    setOfflineMatch(null);
  };

  // Run the Diagnostics routine
  const handleRunDiagnostics = async (mode: 'offline' | 'ai') => {
    setIsDiagnosing(true);
    setResponseMarkdown(null);
    setOfflineMatch(null);
    setErrorFeedback(null);
    setDiagnosticMode(mode);

    if (mode === 'offline') {
      // Simulate rapid diagnostic pathway
      setTimeout(() => {
        const match = offlineKnowledgeBase.find(
          item => item.category === selectedCategory && item.symptomKey === selectedSymptom
        );
        if (match) {
          setOfflineMatch(match);
        } else {
          // General fallback
          setOfflineMatch({
            id: "general_fallback",
            category: selectedCategory,
            symptomKey: selectedSymptom,
            labelEn: "Mild nonspecific distress symptoms",
            labelNe: "सामान्य अस्पष्ट लक्षणहरू",
            diseaseEn: "Nonspecific digestive or environmental stress",
            diseaseNe: "सामान्य पाचन गडबडी वा वातावरणीय तनाव",
            remedyEn: "Isolate individual animal. Add probiotics, electrolyte salts (Jeevan Jal) in drinking water, and maintain optimum environmental ventilation.",
            remedyNe: "बिरामी पशुलाई बथानबाट अलग राख्नुहोस्। सफा पानीमा नवजीवन वा जीवनजल मिसाएर इलेक्ट्रोलाइट्स प्रदान गर्नुहोस् र दाना पानीमा ध्यान दिनुहोस्।",
            preventionEn: "Ensure immaculate biological barriers. Routinely disinfect feeder trays and water troughs.",
            preventionNe: "खोर बाहिर चुना, फिनाइल छर्कनुहोस्। दानापानी भाँडाहरू दैनिक कीटाणुनाशक औषधि मिसाएर धुनुहोस्।",
            organicEn: "Administer crushed raw ginger and neem powder water.",
            organicNe: "काँचो बेसार, अदुवाको रस र नीमको रस मनतातो पानीमा मिसाएर हप्तामा दुई पटक औषधि स्वरूप चलाउनुहोस्।",
            urgency: "MEDIUM CARE"
          });
        }
        setIsDiagnosing(false);
      }, 1000);
    } else {
      // Run Online Gemini AI
      try {
        const payload = {
          category: selectedCategory,
          symptom: selectedSymptom,
          details: customObservation,
          lang: lang,
          season: currentSeason
        };

        const res = await fetch('/api/veterinary-gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.result) {
          setResponseMarkdown(data.result);
        } else if (data.error) {
          setErrorFeedback(data.error);
        } else {
          setErrorFeedback("Could not compile diagnosis response from Gemini server route.");
        }
      } catch (err: any) {
        console.error(err);
        setErrorFeedback(
          lang === 'en'
            ? `Offline fallback recommended. Gemini API error: ${err.message || err}. Please check if GEMINI_API_KEY is configured in Settings > Secrets.`
            : `अफलाइन परामर्श सिफारिस गरिन्छ। जेमिनाई त्रुटि: ${err.message || err} | कृपया Settings > Secrets मा गई एपीआई की कन्फिगर गर्नुहोस्।`
        );
      } finally {
        setIsDiagnosing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Status Panel */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg select-none">
        {/* Subtle background glow graphics */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-md shadow-emerald-950/40">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
                <span>{lang === 'en' ? 'Smart Vet Diagnostics & Advisory' : 'स्मार्ट पशु चिकित्सक परामर्श'}</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold uppercase px-2 py-0.5 rounded-full border border-amber-400 leading-none">
                  AI + Manual
                </span>
              </h2>
              <p className="text-emerald-100 text-xs mt-0.5">Saroja Autonomous Veterinary Intelligence & Seasonal Operations Center</p>
            </div>
          </div>

          <p className="text-emerald-200 text-xs leading-relaxed max-w-3xl text-justify font-medium">
            {lang === 'en'
              ? 'Protecting livestock from changing climates in Barju-4, Sunsari, Nepal. Use our diagnostic tool down below to instantly match bird diarrhea (red/white feces) or goat diseases, learn correct over-the-counter and natural home remedy dosages, and obtain summer/winter survival tips.'
              : 'बर्जु-४, सुनसरी, नेपालको बदलिँदो मौसममा पशुधन सुरक्षित राख्न मद्दत गर्नुहोस्। चल्लाहरूमा पातलो दिसा आउने रोग लक्षण (जस्तै रातो रगतमासी वा सेतो पुलोरम छेर्ने), बाख्राको खुर कुहिने रोग पहिचान गर्न र उपचार विधि बुझ्न तलको म्यानुअल वा एआई परामर्श सेवा चलाउनुहोस्।'}
          </p>
        </div>
      </div>

      {/* Main Container - Divided to Left Inputs and Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Matrix Form (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            
            <div className="pb-3 border-b border-gray-150 flex justify-between items-center">
              <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Stethoscope className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Symptom Tracker Matrix</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold uppercase">
                {selectedCategory}
              </span>
            </div>

            {/* 1. Category Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                {lang === 'en' ? '1. Select Livestock Sector:' : '१. पशुधन क्षेत्र छनौट गर्नुहोस्:'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Poultry', 'Goats', 'Fish', 'Pigeons'] as const).map(cat => {
                  const isActive = selectedCategory === cat;
                  const icons: Record<string, string> = { Poultry: '🐔', Goats: '🐐', Fish: '🐟', Pigeons: '🕊️' };
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        isActive 
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900' 
                          : 'border-gray-250 hover:bg-slate-50 text-gray-600'
                      }`}
                    >
                      <span className="text-lg leading-none">{icons[cat]}</span>
                      <span className="text-[9px] font-bold tracking-tight">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Symptom selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                {lang === 'en' ? '2. Specific Observed Symptoms:' : '२. देखिने मुख्य लक्षणहरू छान्नुहोस्:'}
              </label>
              <select
                value={selectedSymptom}
                onChange={(e) => {
                  setSelectedSymptom(e.target.value);
                  setResponseMarkdown(null);
                  setOfflineMatch(null);
                }}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {getSymptomOptions(selectedCategory).map(opt => (
                  <option key={opt.key} value={opt.key}>
                    {lang === 'en' ? opt.en : opt.ne}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Additional notes and observations */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                {lang === 'en' ? '3. Write custom details (Age, Mortalities today):' : '३. थप विवरण वा उमेर उल्लेख गर्नुहोस्:'}
              </label>
              <textarea
                placeholder={lang === 'en' ? 'e.g. 18-day old chicks, 3 died yesterday. Whitish stools in litter.' : 'उदा. १८ दिने चल्ला, हिजो ३ कुखुरा मरेका, भुसमा सेतो टाँसिने दिसा पाइएको।'}
                rows={3}
                value={customObservation}
                onChange={(e) => setCustomObservation(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-gray-400"
              />
            </div>

            {/* 4. Seasonal selection phase */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                {lang === 'en' ? '4. Current Seasonal Phase:' : '४. चालू चिसो/गर्मी मौसम:'}
              </label>
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentSeason('summer')}
                  className={`py-2 px-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    currentSeason === 'summer'
                      ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-550'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Summer (गर्मी)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSeason('winter')}
                  className={`py-2 px-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    currentSeason === 'winter'
                      ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-550'
                  }`}
                >
                  <CloudSnow className="w-4 h-4 text-sky-500" />
                  <span>Winter (चिसो)</span>
                </button>
              </div>
            </div>

            {/* Dual consultation execution triggers */}
            <div className="space-y-3 pt-3">
              {/* Trigger 1: Real-Time Diagnostic matching offline */}
              <button
                type="button"
                onClick={() => handleRunDiagnostics('offline')}
                disabled={isDiagnosing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl transition cursor-pointer flex justify-center items-center gap-2 shadow"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Run Offline Clinical Match (तत्काल खोज्नुहोस्)</span>
              </button>

              {/* Trigger 2: Online Gemini AI consultation */}
              <button
                type="button"
                onClick={() => handleRunDiagnostics('ai')}
                disabled={isDiagnosing}
                className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-black text-xs py-2.5 px-3 rounded-xl transition cursor-pointer flex justify-center items-center gap-2 shadow"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Ask Gemini Vet Expert AI (एआई चिकित्सक सोध्नुहोस्)</span>
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Diagnostic Outcomes (Span 7) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Sickness analysis results container */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-gray-100 flex justify-between items-center text-xs">
                <span className="font-extrabold text-gray-900 flex items-center gap-1">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Diagnostic Findings:</span>
                </span>
                <span className="text-gray-400 font-mono text-[10px]">
                  Mode: {isDiagnosing ? '...' : (diagnosticMode === 'offline' ? 'Offline Handbook Mirror' : 'Live Gemini AI Network')}
                </span>
              </div>

              {/* Loader visual state */}
              {isDiagnosing && (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-500 font-mono tracking-wider text-center animate-pulse">
                    {diagnosticMode === 'offline' 
                      ? 'Searching internal handbook registers...' 
                      : 'Connecting to Saroja AI Vet Agent server... Processing stool pathogen factors...'}
                  </p>
                </div>
              )}

              {/* General Placeholder */}
              {!isDiagnosing && !offlineMatch && !responseMarkdown && !errorFeedback && (
                <div className="py-16 text-center space-y-3">
                  <div className="text-4xl text-gray-300">🩺</div>
                  <h4 className="text-gray-800 font-extrabold text-xs">Awaiting Diagnostic Signal</h4>
                  <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Choose livestock types (like <strong>Poultry Broilers</strong>), toggle specific <strong>Red/White stool diarrhea</strong> symptoms on the left sidebar, and press run to obtain diagnostics report.
                  </p>
                </div>
              )}

              {/* Error warning response blocks */}
              {!isDiagnosing && errorFeedback && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs space-y-2 text-red-800 my-4">
                  <div className="font-black flex items-center gap-1.5 text-red-950">
                    <AlertCircle className="w-4 h-4 text-red-600 animate-bounce" />
                    <span>Gemini Integration Instruction Config</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-justify">{errorFeedback}</p>
                  <div className="h-px bg-red-150 my-1" />
                  <p className="text-[10px] text-gray-500 font-medium font-mono">
                    💡 Switch: Click the green button <strong className="text-emerald-700">"Run Offline Clinical Match"</strong> to view immediate expert diagnostics from our built-in offline veterinary knowledge base! No internet needed.
                  </p>
                </div>
              )}

              {/* 1. Offline Handbook Mirror Match Render */}
              {!isDiagnosing && offlineMatch && (
                <div className="space-y-5 py-3 animate-fadeIn text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Identified Sickness / रोगको परिचय:</span>
                      <h4 className="text-base font-black text-rose-900 mt-0.5">
                        {lang === 'en' ? offlineMatch.diseaseEn : offlineMatch.diseaseNe}
                      </h4>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                      offlineMatch.urgency === 'HIGH ALERT'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {offlineMatch.urgency}
                    </span>
                  </div>

                  <div className="space-y-4 font-sans font-medium text-gray-700 leading-relaxed">
                    {/* Remedy */}
                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 space-y-1">
                      <h5 className="font-bold text-rose-950 flex items-center gap-1">
                        <CornerDownRight className="w-3.5 h-3.5 text-rose-600" />
                        <span>{lang === 'en' ? 'Standard Veterinary Remedy & Medicines (दवाई उपचार):' : 'प्रमाणित भेटेरिनरी औषधि उपचार र मात्रा:'}</span>
                      </h5>
                      <p className="text-slate-800 text-[11.5px]">{lang === 'en' ? offlineMatch.remedyEn : offlineMatch.remedyNe}</p>
                    </div>

                    {/* Organic Remedy */}
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-1">
                      <h5 className="font-bold text-emerald-950 flex items-center gap-1">
                        <CornerDownRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'en' ? 'Household Organic Remedy (घरेलु जैविक ओषधी):' : 'घरेलु जैबिक र जडिबुटी घरेलु उपचार:'}</span>
                      </h5>
                      <p className="text-slate-800 text-[11.5px]">{lang === 'en' ? offlineMatch.organicEn : offlineMatch.organicNe}</p>
                    </div>

                    {/* Preventions */}
                    <div className="bg-slate-50 border border-slate-250 rounded-xl p-4 space-y-1">
                      <h5 className="font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                        <span>{lang === 'en' ? 'Strict Bio-Security Prevention (रोकथाम):' : 'जैविक सुरक्षा रोकथाम र सुक्खा खोर नियम:'}</span>
                      </h5>
                      <p className="text-slate-800 text-[11.5px]">{lang === 'en' ? offlineMatch.preventionEn : offlineMatch.preventionNe}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Online Gemini AI Response Render */}
              {!isDiagnosing && responseMarkdown && (
                <div className="py-2.5 animate-fadeIn space-y-3">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex justify-between items-center text-xs text-indigo-900">
                    <span className="font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-700" />
                      <span>Live expert diagnosis response generated:</span>
                    </span>
                    <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.2 rounded text-[9px] uppercase">
                      Gemini PRO
                    </span>
                  </div>

                  {/* Render response simply to handle raw formatted text gracefully without crash */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 text-slate-850 font-medium text-xs leading-relaxed space-y-4 whitespace-pre-wrap select-text font-sans scrollbar-thin overflow-y-auto max-h-[450px]">
                    {responseMarkdown}
                  </div>
                </div>
              )}

            </div>

            {/* Note indicator */}
            <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
              <span>* Always consult a certified veterinarian practitioner in Sunsari for clinical injections.</span>
            </div>
          </div>

        </div>

      </div>

      {/* SUMMER & WINTER LIVESTOCK HUSBANDRY ADVISORY BOARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-black text-gray-950 text-sm flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              <span>Sunsari Regional Livestock Weather Advisory Board</span>
            </h3>
            <span className="text-[11px] text-gray-400 leading-none block mt-1">Nepali climate adjustments for Broilers, Goats, Pigeons, and Aqua Tilapia</span>
          </div>

          {/* Quick weather tab switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setCurrentSeason('summer')}
              className={`px-3 py-1.5 rounded-lg font-black transition flex items-center gap-1.5 cursor-pointer ${
                currentSeason === 'summer'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Summer Protocol (गर्मी याम)</span>
            </button>
            <button
              onClick={() => setCurrentSeason('winter')}
              className={`px-3 py-1.5 rounded-lg font-black transition flex items-center gap-1.5 cursor-pointer ${
                currentSeason === 'winter'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              <CloudSnow className="w-3.5 h-3.5" />
              <span>Winter Protocol (जाडो याम)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Season Cards Grid list */}
        {currentSeason === 'summer' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Summer Poultry */}
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-amber-700 uppercase font-black tracking-wide block">🐣 Poultry / Broilers</span>
              <h5 className="font-black text-gray-950 text-xs text-amber-900">Heat Stroke & Dehydration</h5>
              <div className="text-[11px] text-slate-700 space-y-1.5 font-medium leading-relaxed">
                <p>• <strong>Electrolytes:</strong> Add Jeevan Jal/Electral in drinking water daily.</p>
                <p>• <strong>Ventilation:</strong> Run ceiling foggers/coolers from 11 AM to 4 PM.</p>
                <p>• <strong>Feeds:</strong> Halt feed distribution during direct intense heatwaves to prevent crop impaction.</p>
              </div>
            </div>

            {/* Summer Goats */}
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-amber-700 uppercase font-black tracking-wide block">🐐 Boer Goats</span>
              <h5 className="font-black text-gray-950 text-xs text-amber-900">Shade Management</h5>
              <div className="text-[11px] text-slate-700 space-y-1.5 font-medium leading-relaxed">
                <p>• <strong>Fresh Water:</strong> Offer constantly fresh colder borehole water.</p>
                <p>• <strong>Pasturage Hours:</strong> Avoid direct strong sun pasturing between 11 AM to 3 PM.</p>
                <p>• <strong>Salt Licks:</strong> Mandatorily hang mineral blocks to prevent sodium fatigue.</p>
              </div>
            </div>

            {/* Summer Fish */}
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-amber-700 uppercase font-black tracking-wide block">🐟 Tilapia Ponds</span>
              <h5 className="font-black text-gray-950 text-xs text-amber-900">Heavy Organic Blooms</h5>
              <div className="text-[11px] text-slate-700 space-y-1.5 font-medium leading-relaxed">
                <p>• <strong>Hypoxia warnings:</strong> High temperatures deplete pond oxygen completely during humid nights.</p>
                <p>• <strong>Aerator timings:</strong> Run paddle aerators continuously from 2 AM to 6 AM.</p>
                <p>• <strong>Feed dosing:</strong> Decrease feed quantity if water turns highly dark olive green.</p>
              </div>
            </div>

            {/* Summer Pigeons */}
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-amber-700 uppercase font-black tracking-wide block">🕊️ Pigeon Lofts</span>
              <h5 className="font-black text-gray-950 text-xs text-amber-900">Bathing & Water Trays</h5>
              <div className="text-[11px] text-slate-700 space-y-1.5 font-medium leading-relaxed">
                <p>• <strong>Clay Bath Bowls:</strong> Place large clay bowls so pigeons can soak themselves.</p>
                <p>• <strong>Egg Care:</strong> Direct high heat makes pigeon eggs dry. Maintain humidity levels inside cages.</p>
                <p>• <strong>Wire Gauze:</strong> Keep external windows completely open for heavy cross-breeze.</p>
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Winter Poultry */}
            <div className="bg-gradient-to-br from-sky-50/50 to-indigo-50/30 border border-sky-200 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-sky-700 uppercase font-black tracking-wide block">🐣 Poultry / Broilers</span>
              <h5 className="font-black text-gray-950 text-xs text-sky-900">Pneumonia & Brooder Temperatures</h5>
              <div className="text-[11px] text-slate-700 space-y-1.5 font-medium leading-relaxed">
                <p>• <strong>Warm Brooding:</strong> Use infrared heating bulbs to manage 32°C inside brooding zones.</p>
                <p>• <strong>Coop Curtains:</strong> Cover side windows with clean jute sacks during dark foggy nights.</p>
                <p>• <strong>Litter moisture:</strong> Wet litter triggers ammonia gas and respiratory snoring. Rake weekly.</p>
              </div>
            </div>

            {/* Winter Goats */}
            <div className="bg-gradient-to-br from-sky-50/50 to-indigo-50/30 border border-sky-200 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-sky-700 uppercase font-black tracking-wide block">🐐 Boer Goats</span>
              <h5 className="font-black text-gray-950 text-xs text-sky-900">Elevated Slats & Draft blocks</h5>
              <div className="text-[11px] text-slate-700 space-y-1.5 font-medium leading-relaxed">
                <p>• <strong>Dry Elevators:</strong> Goats caught sitting on wet cold flooring will develop severe pneumonia.</p>
                <p>• <strong>Warm Water:</strong> Avoid ice-cold drinking water to prevent ruminal temperature drops.</p>
                <p>• <strong>Dry Feeds:</strong> Increase dry maize/rye grass concentration for thermoregulation.</p>
              </div>
            </div>

            {/* Winter Fish */}
            <div className="bg-gradient-to-br from-sky-50/50 to-indigo-50/30 border border-sky-200 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-sky-700 uppercase font-black tracking-wide block">🐟 Tilapia Ponds</span>
              <h5 className="font-black text-gray-950 text-xs text-sky-900">Halted Metabolism</h5>
              <div className="text-[11px] text-slate-700 space-y-1.5 font-medium leading-relaxed">
                <p>• <strong>Low Feed Intake:</strong> Water temperature below 18°C causes tilapia to go dormant.</p>
                <p>• <strong>Reduce Feeds:</strong> Lower feeding rate to 1% of fish biomass. Never overfeed in winter.</p>
                <p>• <strong>Lime spraying:</strong> Add agricultural lime dose to balance pH on foggy weeks.</p>
              </div>
            </div>

            {/* Winter Pigeons */}
            <div className="bg-gradient-to-br from-sky-50/50 to-indigo-50/30 border border-sky-200 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-sky-700 uppercase font-black tracking-wide block">🕊️ Pigeon Lofts</span>
              <h5 className="font-black text-gray-950 text-xs text-sky-900">Cold Wind Shielding</h5>
              <div className="text-[11px] text-slate-700 space-y-1.5 font-medium leading-relaxed">
                <p>• <strong>Wind Shielding:</strong> Drape north-facing cages with tarpaulins to prevent frozen drafts.</p>
                <p>• <strong>Fat seeds:</strong> Increase sunflower and mustard seed ratios to keep pigeons warm.</p>
                <p>• <strong>Dry Nesting:</strong> Frequently clean nests from poop, add warm dry clean straw material.</p>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
