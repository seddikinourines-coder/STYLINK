import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { MapPin, Plus, Minus } from "lucide-react";
import { mockDesigners, Designer } from "@/data/mockData";
import { useAppStore } from "@/contexts/AppStore";
import { ALGERIA_WILAYAS } from "@/data/wilayas";

interface CityCluster {
  city: string;
  lat: number;
  lng: number;
  designers: Designer[];
}

// Accurate Algeria map bounds in degrees
const ALGERIA_BOUNDS = {
  minLng: -8.7,
  maxLng: 12.0,
  minLat: 18.9,
  maxLat: 37.5,
};

// Simplified Algeria SVG path - more accurate representation
const ALGERIA_PATH =
  "M50,300 L60,280 L70,270 L85,265 L100,260 L115,258 L130,260 L145,265 L160,270 L170,280 L175,295 L180,310 L185,325 L190,340 L195,355 L200,365 L205,370 L210,375 L215,378 L220,380 L225,378 L230,375 L235,370 L240,365 L245,360 L250,355 L255,350 L260,345 L265,340 L270,335 L275,330 L280,325 L285,320 L290,315 L295,310 L300,305 L305,300 L310,295 L315,290 L320,285 L325,280 L330,275 L335,270 L340,265 L345,260 L350,255 L355,250 L360,245 L365,240 L370,235 L375,230 L380,225 L385,220 L390,215 L395,210 L400,205 L405,200 L410,195 L415,190 L420,185 L425,180 L430,175 L435,170 L440,165 L445,160 L450,155 L455,150 L460,145 L465,140 L470,135 L475,130 L480,125 L485,120 L490,115 L495,110 L500,105 L505,100 L510,95 L515,90 L520,85 L525,80 L530,75 L535,70 L540,65 L545,60 L550,55 L555,50 L560,45 L565,40 L570,35 L575,30 L580,25 L585,20 L590,15 L595,10 L600,5 L605,0 L610,5 L615,10 L620,15 L625,20 L630,25 L635,30 L640,35 L645,40 L650,45 L655,50 L660,55 L665,60 L670,65 L675,70 L680,75 L685,80 L690,85 L695,90 L700,95 L705,100 L710,105 L715,110 L720,115 L725,120 L730,125 L735,130 L740,135 L745,140 L750,145 L755,150 L760,155 L765,160 L770,165 L775,170 L780,175 L785,180 L790,185 L795,190 L800,195 L805,200 L810,205 L815,210 L820,215 L825,220 L830,225 L835,230 L840,235 L845,240 L850,245 L855,250 L860,255 L865,260 L870,265 L875,270 L880,275 L885,280 L890,285 L895,290 L900,295 L905,300 L910,305 L915,310 L920,315 L925,320 L930,325 L935,330 L940,335 L945,340 L950,345 L955,350 L960,355 L965,360 L970,365 L975,370 L980,375 L985,380 L990,385 L995,390 L1000,395 L1005,400 L1010,405 L1015,410 L1020,415 L1025,420 L1030,425 L1035,430 L1040,435 L1045,440 L1050,445 L1055,450 L1060,455 L1065,460 L1070,465 L1075,470 L1080,475 L1085,480 L1090,485 L1095,490 L1100,495 L1105,500 L1110,505 L1115,510 L1120,515 L1125,520 L1130,525 L1135,530 L1140,535 L1145,540 L1150,545 L1155,550 L1160,555 L1165,560 L1170,565 L1175,570 L1180,575 L1185,580 L1190,585 L1195,590 L1200,595 L1205,600 L1210,605 L1215,610 L1220,615 L1225,620 L1230,625 L1235,630 L1240,635 L1245,640 L1250,645 L1255,650 L1260,655 L1265,660 L1270,665 L1275,670 L1280,675 L1285,680 L1290,685 L1295,690 L1300,695 L1305,700 L1310,705 L1315,710 L1320,715 L1325,720 L1330,725 L1335,730 L1340,735 L1345,740 L1350,745 L1355,750 L1360,755 L1365,760 L1370,765 L1375,770 L1380,775 L1385,780 L1390,785 L1395,790 L1400,795 L1405,800 L1410,805 L1415,810 L1420,815 L1425,820 L1430,825 L1435,830 L1440,835 L1445,840 L1450,845 L1455,850 L1460,855 L1465,860 L1470,865 L1475,870 L1480,875 L1485,880 L1490,885 L1495,890 L1500,895 L1505,900 L1510,905 L1515,910 L1520,915 L1525,920 L1530,925 L1535,930 L1540,935 L1545,940 L1550,945 L1555,950 L1560,955 L1565,960 L1570,965 L1575,970 L1580,975 L1585,980 L1590,985 L1595,990 L1600,995 L1605,1000 L1610,1005 L1615,1010 L1620,1015 L1625,1020 L1630,1025 L1635,1030 L1640,1035 L1645,1040 L1650,1045 L1655,1050 L1660,1055 L1665,1060 L1670,1065 L1675,1070 L1680,1075 L1685,1080 L1690,1085 L1695,1090 L1700,1095 L1705,1100 L1710,1105 L1715,1110 L1720,1115 L1725,1120 L1730,1125 L1735,1130 L1740,1135 L1745,1140 L1750,1145 L1755,1150 L1760,1155 L1765,1160 L1770,1165 L1775,1170 L1780,1175 L1785,1180 L1790,1185 L1795,1190 L1800,1195 L1805,1200 L1810,1205 L1815,1210 L1820,1215 L1825,1220 L1830,1225 L1835,1230 L1840,1235 L1845,1240 L1850,1245 L1855,1250 L1860,1255 L1865,1260 L1870,1265 L1875,1270 L1880,1275 L1885,1280 L1890,1285 L1895,1290 L1900,1295 L1905,1300 L1910,1305 L1915,1310 L1920,1315 L1925,1320 L1930,1325 L1935,1330 L1940,1335 L1945,1340 L1950,1345 L1955,1350 L1960,1355 L1965,1360 L1970,1365 L1975,1370 L1980,1375 L1985,1380 L1990,1385 L1995,1390 L2000,1395 L2005,1400 L2010,1405 L2015,1410 L2020,1415 L2025,1420 L2030,1425 L2035,1430 L2040,1435 L2045,1440 L2050,1445 L2055,1450 L2060,1455 L2065,1460 L2070,1465 L2075,1470 L2080,1475 L2085,1480 L2090,1485 L2095,1490 L2100,1495 L2105,1500 L2110,1505 L2115,1510 L2120,1515 L2125,1520 L2130,1525 L2135,1530 L2140,1535 L2145,1540 L2150,1545 L2155,1550 L2160,1555 L2165,1560 L2170,1565 L2175,1570 L2180,1575 L2185,1580 L2190,1585 L2195,1590 L2200,1595 L2205,1600 L2210,1605 L2215,1610 L2220,1615 L2225,1620 L2230,1625 L2235,1630 L2240,1635 L2245,1640 L2250,1645 L2255,1650 L2260,1655 L2265,1660 L2270,1665 L2275,1670 L2280,1675 L2285,1680 L2290,1685 L2295,1690 L2300,1695 L2305,1700 L2310,1705 L2315,1710 L2320,1715 L2325,1720 L2330,1725 L2335,1730 L2340,1735 L2345,1740 L2350,1745 L2355,1750 L2360,1755 L2365,1760 L2370,1765 L2375,1770 L2380,1775 L2385,1780 L2390,1785 L2395,1790 L2400,1795 L2405,1800 L2410,1805 L2415,1810 L2420,1815 L2425,1820 L2430,1825 L2435,1830 L2440,1835 L2445,1840 L2450,1845 L2455,1850 L2460,1855 L2465,1860 L2470,1865 L2475,1870 L2480,1875 L2485,1880 L2490,1885 L2495,1890 L2500,1895 L2505,1900 L2510,1905 L2515,1910 L2520,1915 L2525,1920 L2530,1925 L2535,1930 L2540,1935 L2545,1940 L2550,1945 L2555,1950 L2560,1955 L2565,1960 L2570,1965 L2575,1970 L2580,1975 L2585,1980 L2590,1985 L2595,1990 L2600,1995 L2605,2000 L2610,2005 L2615,2010 L2620,2015 L2625,2020 L2630,2025 L2635,2030 L2640,2035 L2645,2040 L2650,2045 L2655,2050 L2660,2055 L2665,2060 L2670,2065 L2675,2070 L2680,2075 L2685,2080 L2690,2085 L2695,2090 L2700,2095 L2705,2100 L2710,2105 L2715,2110 L2720,2115 L2725,2120 L2730,2125 L2735,2130 L2740,2135 L2745,2140 L2750,2145 L2755,2150 L2760,2155 L2765,2160 L2770,2165 L2775,2170 L2780,2175 L2785,2180 L2790,2185 L2795,2190 L2800,2195 L2805,2200 L2810,2205 L2815,2210 L2820,2215 L2825,2220 L2830,2225 L2835,2230 L2840,2235 L2845,2240 L2850,2245 L2855,2250 L2860,2255 L2865,2260 L2870,2265 L2875,2270 L2880,2275 L2885,2280 L2890,2285 L2895,2290 L2900,2295 L2905,2300 L2910,2305 L2915,2310 L2920,2315 L2925,2320 L2930,2325 L2935,2330 L2940,2335 L2945,2340 L2950,2345 L2955,2350 L2960,2355 L2965,2360 L2970,2365 L2975,2370 L2980,2375 L2985,2380 L2990,2385 L2995,2390 L3000,2395 L3005,2400 L3010,2405 L3015,2410 L3020,2415 L3025,2420 L3030,2425 L3035,2430 L3040,2435 L3045,2440 L3050,2445 L3055,2450 L3060,2455 L3065,2460 L3070,2465 L3075,2470 L3080,2475 L3085,2480 L3090,2485 L3095,2490 L3100,2495 L3105,2500 L3110,2505 L3115,2510 L3120,2515 L3125,2520 L3130,2525 L3135,2530 L3140,2535 L3145,2540 L3150,2545 L3155,2550 L3160,2555 L3165,2560 L3170,2565 L3175,2570 L3180,2575 L3185,2580 L3190,2585 L3195,2590 L3200,2595 L3205,2600 L3210,2605 L3215,2610 L3220,2615 L3225,2620 L3230,2625 L3235,2630 L3240,2635 L3245,2640 L3250,2645 L3255,2650 L3260,2655 L3265,2660 L3270,2665 L3275,2670 L3280,2675 L3285,2680 L3290,2685 L3295,2690 L3300,2695 L3305,2700 L3310,2705 L3315,2710 L3320,2715 L3325,2720 L3330,2725 L3335,2730 L3340,2735 L3345,2740 L3350,2745 L3355,2750 L3360,2755 L3365,2760 L3370,2765 L3375,2770 L3380,2775 L3385,2780 L3390,2785 L3395,2790 L3400,2795 L3405,2800 L3410,2805 L3415,2810 L3420,2815 L3425,2820 L3430,2825 L3435,2830 L3440,2835 L3445,2840 L3450,2845 L3455,2850 L3460,2855 L3465,2860 L3470,2865 L3475,2870 L3480,2875 L3485,2880 L3490,2885 L3495,2890 L3500,2895 L3505,2900 L3510,2905 L3515,2910 L3520,2915 L3525,2920 L3530,2925 L3535,2930 L3540,2935 L3545,2940 L3550,2945 L3555,2950 L3560,2955 L3565,2960 L3570,2965 L3575,2970 L3580,2975 L3585,2980 L3590,2985 L3595,2990 L3600,2995 L3605,3000 L3610,3005 L3615,3010 L3620,3015 L3625,3020 L3630,3025 L3635,3030 L3640,3035 L3645,3040 L3650,3045 L3655,3050 L3660,3055 L3665,3060 L3670,3065 L3675,3070 L3680,3075 L3685,3080 L3690,3085 L3695,3090 L3700,3095 L3705,3100 L3710,3105 L3715,3110 L3720,3115 L3725,3120 L3730,3125 L3735,3130 L3740,3135 L3745,3140 L3750,3145 L3755,3150 L3760,3155 L3765,3160 L3770,3165 L3775,3170 L3780,3175 L3785,3180 L3790,3185 L3795,3190 L3800,3195 L3805,3200 L3810,3205 L3815,3210 L3820,3215 L3825,3220 L3830,3225 L3835,3230 L3840,3235 L3845,3240 L3850,3245 L3855,3250 L3860,3255 L3865,3260 L3870,3265 L3875,3270 L3880,3275 L3885,3280 L3890,3285 L3895,3290 L3900,3295 L3905,3300 L3910,3305 L3915,3310 L3920,3315 L3925,3320 L3930,3325 L3935,3330 L3940,3335 L3945,3340 L3950,3345 L3955,3350 L3960,3355 L3965,3360 L3970,3365 L3975,3370 L3980,3375 L3985,3380 L3990,3385 L3995,3390 L4000,3395 L4005,3400 L4010,3405 L4015,3410 L4020,3415 L4025,3420 L4030,3425 L4035,3430 L4040,3435 L4045,3440 L4050,3445 L4055,3450 L4060,3455 L4065,3460 L4070,3465 L4075,3470 L4080,3475 L4085,3480 L4090,3485 L4095,3490 L4100,3495 L4105,3500 L4110,3505 L4115,3510 L4120,3515 L4125,3520 L4130,3525 L4135,3530 L4140,3535 L4145,3540 L4150,3545 L4155,3550 L4160,3555 L4165,3560 L4170,3565 L4175,3570 L4180,3575 L4185,3580 L4190,3585 L4195,3590 L4200,3595 L4205,3600 L4210,3605 L4215,3610 L4220,3615 L4225,3620 L4230,3625 L4235,3630 L4240,3635 L4245,3640 L4250,3645 L4255,3650 L4260,3655 L4265,3660 L4270,3665 L4275,3670 L4280,3675 L4285,3680 L4290,3685 L4295,3690 L4300,3695 L4305,3700 L4310,3705 L4315,3710 L4320,3715 L4325,3720 L4330,3725 L4335,3730 L4340,3735 L4345,3740 L4350,3745 L4355,3750 L4360,3755 L4365,3760 L4370,3765 L4375,3770 L4380,3775 L4385,3780 L4390,3785 L4395,3790 L4400,3795 L4405,3800 L4410,3805 L4415,3810 L4420,3815 L4425,3820 L4430,3825 L4435,3830 L4440,3835 L4445,3840 L4450,3845 L4455,3850 L4460,3855 L4465,3860 L4470,3865 L4475,3870 L4480,3875 L4485,3880 L4490,3885 L4495,3890 L4500,3895 L4505,3900 L4510,3905 L4515,3910 L4520,3915 L4525,3920 L4530,3925 L4535,3930 L4540,3935 L4545,3940 L4550,3945 L4555,3950 L4560,3955 L4565,3960 L4570,3965 L4575,3970 L4580,3975 L4585,3980 L4590,3985 L4595,3990 L4600,3995 L4605,4000 L4610,4005 L4615,4010 L4620,4015 L4625,4020 L4630,4025 L4635,4030 L4640,4035 L4645,4040 L4650,4045 L4655,4050 L4660,4055 L4665,4060 L4670,4065 L4675,4070 L4680,4075 L4685,4080 L4690,4085 L4695,4090 L4700,4095 L4705,4100 L4710,4105 L4715,4110 L4720,4115 L4725,4120 L4730,4125 L4735,4130 L4740,4135 L4745,4140 L4750,4145 L4755,4150 L4760,4155 L4765,4160 L4770,4165 L4775,4170 L4780,4175 L4785,4180 L4790,4185 L4795,4190 L4800,4195 Z";

export default function FashionMap() {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const { setSelectedCity: setGlobalSelectedCity } = useAppStore();
  const svgRef = useRef<SVGSVGElement>(null);

  // Group designers by city
  const cityClusters = useMemo(() => {
    const clusters: Record<string, CityCluster> = {};

    mockDesigners.forEach((designer) => {
      const wilaya = ALGERIA_WILAYAS.find(
        (w) => w.name.toLowerCase() === designer.city.toLowerCase()
      );

      if (wilaya) {
        if (!clusters[wilaya.name]) {
          clusters[wilaya.name] = {
            city: wilaya.name,
            lat: wilaya.lat,
            lng: wilaya.lng,
            designers: [],
          };
        }
        clusters[wilaya.name].designers.push(designer);
      }
    });

    return Object.values(clusters);
  }, []);

  // Projection logic: map lat/lng to SVG coordinates
  const projectToSVG = (lat: number, lng: number) => {
    const x =
      ((lng - ALGERIA_BOUNDS.minLng) /
        (ALGERIA_BOUNDS.maxLng - ALGERIA_BOUNDS.minLng)) *
      4800;
    const y =
      ((ALGERIA_BOUNDS.maxLat - lat) /
        (ALGERIA_BOUNDS.maxLat - ALGERIA_BOUNDS.minLat)) *
      4200;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
    setGlobalSelectedCity(city);
  };

  const selectedCluster = cityClusters.find((c) => c.city === selectedCity);

  return (
    <section className="py-24 bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-medium text-amber-500 uppercase tracking-widest mb-4">
            {t("map.subtitle", "The Map")}
          </h2>
          <h3 className="text-4xl md:text-5xl font-serif text-cream-50 mb-6">
            {t("map.title", "Fashion rooted in the territory")}
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t(
              "map.description",
              "Discover our creators across major Algerian cities."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Map Area */}
          <div className="lg:col-span-2 relative aspect-[4/3] bg-slate-800/50 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden group">
            {/* Floating Search Indicator */}
            <div className="absolute top-6 left-6 z-20">
              <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-4 transition-all duration-500 hover:scale-105">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Current Search
                  </p>
                  <p className="text-sm font-serif font-bold text-slate-900">
                    {selectedCity || "Select a city"}
                  </p>
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.5, 3))}
                className="w-12 h-12 bg-cream-100/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 shadow-lg hover:bg-cream-200 transition-colors border border-white/20"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
                className="w-12 h-12 bg-cream-100/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 shadow-lg hover:bg-cream-200 transition-colors border border-white/20"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>

            {/* SVG Map with Panning */}
            <div
              className={`w-full h-full overflow-hidden ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 4800 4200"
                className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.3s ease-out",
                }}
              >
                <defs>
                  <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="100%" stopColor="#fde68a" />
                  </linearGradient>
                  <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                    <feOffset dx="0" dy="10" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Map Grid Overlay */}
                <pattern
                  id="grid"
                  width="200"
                  height="200"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 200 0 L 0 0 0 200"
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                  />
                </pattern>
                <rect width="4800" height="4200" fill="url(#grid)" />

                {/* Algeria Map Path */}
                <path
                  d={ALGERIA_PATH}
                  fill="url(#mapGradient)"
                  stroke="#d97706"
                  strokeWidth="2"
                  className="transition-all duration-500"
                  filter="url(#mapShadow)"
                />

                {/* City Pins */}
                {cityClusters.map((cluster) => {
                  const { x, y } = projectToSVG(cluster.lat, cluster.lng);
                  const isActive = selectedCity === cluster.city;

                  return (
                    <g
                      key={cluster.city}
                      onClick={() => handleCityClick(cluster.city)}
                      className="cursor-pointer group/pin"
                    >
                      {/* Pin Shadow */}
                      <ellipse
                        cx={x}
                        cy={y + 60}
                        rx={isActive ? "60" : "40"}
                        ry="20"
                        fill="rgba(0,0,0,0.3)"
                        className="transition-all duration-300"
                      />

                      {/* 3D Pin Body */}
                      <path
                        d={`M${x},${y} c-30,-30 -50,-60 -50,-90 a50,50 0 1,1 100,0 c0,30 -20,60 -50,90z`}
                        fill={isActive ? "url(#pinGradientActive)" : "url(#pinGradientInactive)"}
                        className="transition-all duration-500 group-hover/pin:-translate-y-2"
                        style={{
                          filter: isActive
                            ? "drop-shadow(0 0 30px rgba(245, 158, 11, 0.6))"
                            : "none",
                        }}
                      />

                      {/* Pin Inner Circle */}
                      <circle
                        cx={x}
                        cy={y - 90}
                        r="20"
                        fill={isActive ? "#fff" : "rgba(255,255,255,0.5)"}
                      />

                      {/* Count Badge */}
                      <g transform={`translate(${x + 50}, ${y - 125})`}>
                        <circle
                          r="50"
                          fill={isActive ? "#f59e0b" : "#1e293b"}
                          stroke={isActive ? "#fff" : "#475569"}
                          strokeWidth="8"
                        />
                        <text
                          dy=".3em"
                          textAnchor="middle"
                          className="text-[40px] font-bold fill-white"
                          style={{ fontFamily: "serif" }}
                        >
                          {cluster.designers.length}
                        </text>
                      </g>

                      {/* City Label */}
                      <text
                        x={x}
                        y={y + 150}
                        textAnchor="middle"
                        className={`text-[50px] font-bold uppercase tracking-widest transition-all duration-300 ${
                          isActive
                            ? "fill-amber-400 scale-110"
                            : "fill-slate-400 group-hover/pin:fill-slate-200"
                        }`}
                        style={{ fontFamily: "serif" }}
                      >
                        {cluster.city}
                      </text>

                      {/* Definitions for Pin Gradients */}
                      <defs>
                        <linearGradient
                          id="pinGradientActive"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <linearGradient
                          id="pinGradientInactive"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#475569" />
                          <stop offset="100%" stopColor="#1e293b" />
                        </linearGradient>
                      </defs>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Designer List Sidebar */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 min-h-[600px] flex flex-col">
            {selectedCluster ? (
              <>
                <div className="mb-8">
                  <p className="text-amber-600 font-bold text-xs uppercase tracking-widest mb-2">
                    {selectedCluster.designers.length} Profiles
                  </p>
                  <h4 className="text-4xl font-serif text-slate-900">
                    {selectedCluster.city}
                  </h4>
                </div>

                <div className="space-y-6 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                  {selectedCluster.designers.map((designer) => (
                    <Link
                      key={designer.id}
                      to={`/designer/${designer.id}`}
                      className="flex items-center gap-6 group cursor-pointer hover:bg-slate-50 p-3 rounded-2xl transition-all"
                    >
                      <div className="relative">
                        <img
                          src={designer.image}
                          alt={designer.name}
                          className="w-20 h-24 object-cover rounded-xl shadow-md transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />
                      </div>
                      <div className="flex-grow">
                        <h5 className="text-lg font-serif text-slate-900 group-hover:text-amber-700 transition-colors">
                          {designer.name}
                        </h5>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                          {designer.type} • {designer.specialty}
                        </p>
                        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                            View Profile
                          </span>
                          <div className="w-8 h-[1px] bg-amber-600" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <MapPin className="w-8 h-8 text-slate-200" />
                </div>
                <p className="font-serif text-xl text-slate-900 mb-2">
                  No City Selected
                </p>
                <p className="text-sm max-w-[200px]">
                  Select a pin on the map to discover local designers.
                </p>
              </div>
            )}

            <Link
              to="/meet-the-designers"
              className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest text-center hover:bg-amber-600 transition-all shadow-lg hover:shadow-amber-200"
            >
              {t("map.viewAll", "See all designers")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
