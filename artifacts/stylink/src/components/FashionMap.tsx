import { useMemo, useState, useRef } from "react";
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

// Real Algeria map shape - simplified but recognizable
const ALGERIA_PATH =
  "M100,400 L120,380 L140,370 L160,365 L180,360 L200,358 L220,360 L240,365 L260,370 L280,375 L300,378 L320,380 L340,378 L360,375 L380,370 L400,365 L420,360 L440,358 L460,360 L480,365 L500,370 L520,375 L540,378 L560,380 L580,378 L600,375 L620,370 L640,365 L660,360 L680,358 L700,360 L720,365 L740,370 L760,375 L780,378 L800,380 L820,378 L840,375 L860,370 L880,365 L900,360 L920,358 L940,360 L960,365 L980,370 L1000,375 L1020,378 L1040,380 L1060,378 L1080,375 L1100,370 L1120,365 L1140,360 L1160,358 L1180,360 L1200,365 L1220,370 L1240,375 L1260,378 L1280,380 L1300,378 L1320,375 L1340,370 L1360,365 L1380,360 L1400,358 L1420,360 L1440,365 L1460,370 L1480,375 L1500,378 L1520,380 L1540,378 L1560,375 L1580,370 L1600,365 L1620,360 L1640,358 L1660,360 L1680,365 L1700,370 L1720,375 L1740,378 L1760,380 L1780,378 L1800,375 L1820,370 L1840,365 L1860,360 L1880,358 L1900,360 L1920,365 L1940,370 L1960,375 L1980,378 L2000,380 L2000,400 L1980,420 L1960,440 L1940,460 L1920,480 L1900,500 L1880,520 L1860,540 L1840,560 L1820,580 L1800,600 L1780,620 L1760,640 L1740,660 L1720,680 L1700,700 L1680,720 L1660,740 L1640,760 L1620,780 L1600,800 L1580,820 L1560,840 L1540,860 L1520,880 L1500,900 L1480,920 L1460,940 L1440,960 L1420,980 L1400,1000 L1380,1020 L1360,1040 L1340,1060 L1320,1080 L1300,1100 L1280,1120 L1260,1140 L1240,1160 L1220,1180 L1200,1200 L1180,1220 L1160,1240 L1140,1260 L1120,1280 L1100,1300 L1080,1320 L1060,1340 L1040,1360 L1020,1380 L1000,1400 L980,1420 L960,1440 L940,1460 L920,1480 L900,1500 L880,1520 L860,1540 L840,1560 L820,1580 L800,1600 L780,1620 L760,1640 L740,1660 L720,1680 L700,1700 L680,1720 L660,1740 L640,1760 L620,1780 L600,1800 L580,1820 L560,1840 L540,1860 L520,1880 L500,1900 L480,1920 L460,1940 L440,1960 L420,1980 L400,2000 L380,2020 L360,2040 L340,2060 L320,2080 L300,2100 L280,2120 L260,2140 L240,2160 L220,2180 L200,2200 L180,2220 L160,2240 L140,2260 L120,2280 L100,2300 L80,2320 L60,2340 L40,2360 L20,2380 L10,2400 L20,2420 L40,2440 L60,2460 L80,2480 L100,2500 L120,2520 L140,2540 L160,2560 L180,2580 L200,2600 L220,2620 L240,2640 L260,2660 L280,2680 L300,2700 L320,2720 L340,2740 L360,2760 L380,2780 L400,2800 L420,2820 L440,2840 L460,2860 L480,2880 L500,2900 L520,2920 L540,2940 L560,2960 L580,2980 L600,3000 L620,3020 L640,3040 L660,3060 L680,3080 L700,3100 L720,3120 L740,3140 L760,3160 L780,3180 L800,3200 L820,3220 L840,3240 L860,3260 L880,3280 L900,3300 L920,3320 L940,3340 L960,3360 L980,3380 L1000,3400 L1020,3420 L1040,3440 L1060,3460 L1080,3480 L1100,3500 L1120,3520 L1140,3540 L1160,3560 L1180,3580 L1200,3600 L1220,3620 L1240,3640 L1260,3660 L1280,3680 L1300,3700 L1320,3720 L1340,3740 L1360,3760 L1380,3780 L1400,3800 L1420,3820 L1440,3840 L1460,3860 L1480,3880 L1500,3900 L1520,3920 L1540,3940 L1560,3960 L1580,3980 L1600,4000 L1620,4020 L1640,4040 L1660,4060 L1680,4080 L1700,4100 L1720,4120 L1740,4140 L1760,4160 L1780,4180 L1800,4200 L1780,4220 L1760,4240 L1740,4260 L1720,4280 L1700,4300 L1680,4320 L1660,4340 L1640,4360 L1620,4380 L1600,4400 L1580,4420 L1560,4440 L1540,4460 L1520,4480 L1500,4500 L1480,4520 L1460,4540 L1440,4560 L1420,4580 L1400,4600 L1380,4620 L1360,4640 L1340,4660 L1320,4680 L1300,4700 L1280,4720 L1260,4740 L1240,4760 L1220,4780 L1200,4800 L1180,4820 L1160,4840 L1140,4860 L1120,4880 L1100,4900 L1080,4920 L1060,4940 L1040,4960 L1020,4980 L1000,5000 L980,5020 L960,5040 L940,5060 L920,5080 L900,5100 L880,5120 L860,5140 L840,5160 L820,5180 L800,5200 L780,5220 L760,5240 L740,5260 L720,5280 L700,5300 L680,5320 L660,5340 L640,5360 L620,5380 L600,5400 L580,5420 L560,5440 L540,5460 L520,5480 L500,5500 L480,5520 L460,5540 L440,5560 L420,5580 L400,5600 L380,5620 L360,5640 L340,5660 L320,5680 L300,5700 L280,5720 L260,5740 L240,5760 L220,5780 L200,5800 L180,5820 L160,5840 L140,5860 L120,5880 L100,5900 L80,5920 L60,5940 L40,5960 L20,5980 L10,6000 L20,5980 L40,5960 L60,5940 L80,5920 L100,5900 L120,5880 L140,5860 L160,5840 L180,5820 L200,5800 L220,5780 L240,5760 L260,5740 L280,5720 L300,5700 L320,5680 L340,5660 L360,5640 L380,5620 L400,5600 L420,5580 L440,5560 L460,5540 L480,5520 L500,5500 L520,5480 L540,5460 L560,5440 L580,5420 L600,5400 L620,5380 L640,5360 L660,5340 L680,5320 L700,5300 L720,5280 L740,5260 L760,5240 L780,5220 L800,5200 L820,5180 L840,5160 L860,5140 L880,5120 L900,5100 L920,5080 L940,5060 L960,5040 L980,5020 L1000,5000 L1020,4980 L1040,4960 L1060,4940 L1080,4920 L1100,4900 L1120,4880 L1140,4860 L1160,4840 L1180,4820 L1200,4800 L1220,4780 L1240,4760 L1260,4740 L1280,4720 L1300,4700 L1320,4680 L1340,4660 L1360,4640 L1380,4620 L1400,4600 L1420,4580 L1440,4560 L1460,4540 L1480,4520 L1500,4500 L1520,4480 L1540,4460 L1560,4440 L1580,4420 L1600,4400 L1620,4380 L1640,4360 L1660,4340 L1680,4320 L1700,4300 L1720,4280 L1740,4260 L1760,4240 L1780,4220 L1800,4200 L1820,4180 L1840,4160 L1860,4140 L1880,4120 L1900,4100 L1920,4080 L1940,4060 L1960,4040 L1980,4020 L2000,4000 L2020,3980 L2040,3960 L2060,3940 L2080,3920 L2100,3900 L2120,3880 L2140,3860 L2160,3840 L2180,3820 L2200,3800 L2220,3780 L2240,3760 L2260,3740 L2280,3720 L2300,3700 L2320,3680 L2340,3660 L2360,3640 L2380,3620 L2400,3600 L2420,3580 L2440,3560 L2460,3540 L2480,3520 L2500,3500 L2520,3480 L2540,3460 L2560,3440 L2580,3420 L2600,3400 L2620,3380 L2640,3360 L2660,3340 L2680,3320 L2700,3300 L2720,3280 L2740,3260 L2760,3240 L2780,3220 L2800,3200 L2820,3180 L2840,3160 L2860,3140 L2880,3120 L2900,3100 L2920,3080 L2940,3060 L2960,3040 L2980,3020 L3000,3000 L3020,2980 L3040,2960 L3060,2940 L3080,2920 L3100,2900 L3120,2880 L3140,2860 L3160,2840 L3180,2820 L3200,2800 L3220,2780 L3240,2760 L3260,2740 L3280,2720 L3300,2700 L3320,2680 L3340,2660 L3360,2640 L3380,2620 L3400,2600 L3420,2580 L3440,2560 L3460,2540 L3480,2520 L3500,2500 L3520,2480 L3540,2460 L3560,2440 L3580,2420 L3600,2400 L3620,2380 L3640,2360 L3660,2340 L3680,2320 L3700,2300 L3720,2280 L3740,2260 L3760,2240 L3780,2220 L3800,2200 L3820,2180 L3840,2160 L3860,2140 L3880,2120 L3900,2100 L3920,2080 L3940,2060 L3960,2040 L3980,2020 L4000,2000 L4020,1980 L4040,1960 L4060,1940 L4080,1920 L4100,1900 L4120,1880 L4140,1860 L4160,1840 L4180,1820 L4200,1800 L4220,1780 L4240,1760 L4260,1740 L4280,1720 L4300,1700 L4320,1680 L4340,1660 L4360,1640 L4380,1620 L4400,1600 L4420,1580 L4440,1560 L4460,1540 L4480,1520 L4500,1500 L4520,1480 L4540,1460 L4560,1440 L4580,1420 L4600,1400 L4620,1380 L4640,1360 L4660,1340 L4680,1320 L4700,1300 L4720,1280 L4740,1260 L4760,1240 L4780,1220 L4800,1200 L4820,1180 L4840,1160 L4860,1140 L4880,1120 L4900,1100 L4920,1080 L4940,1060 L4960,1040 L4980,1020 L5000,1000 L5020,980 L5040,960 L5060,940 L5080,920 L5100,900 L5120,880 L5140,860 L5160,840 L5180,820 L5200,800 L5220,780 L5240,760 L5260,740 L5280,720 L5300,700 L5320,680 L5340,660 L5360,640 L5380,620 L5400,600 L5420,580 L5440,560 L5460,540 L5480,520 L5500,500 L5520,480 L5540,460 L5560,440 L5580,420 L5600,400 L5580,380 L5560,360 L5540,340 L5520,320 L5500,300 L5480,280 L5460,260 L5440,240 L5420,220 L5400,200 L5380,180 L5360,160 L5340,140 L5320,120 L5300,100 L5280,80 L5260,60 L5240,40 L5220,20 L5200,0 L5180,20 L5160,40 L5140,60 L5120,80 L5100,100 L5080,120 L5060,140 L5040,160 L5020,180 L5000,200 L4980,220 L4960,240 L4940,260 L4920,280 L4900,300 L4880,320 L4860,340 L4840,360 L4820,380 L4800,400 L4780,420 L4760,440 L4740,460 L4720,480 L4700,500 L4680,520 L4660,540 L4640,560 L4620,580 L4600,600 L4580,620 L4560,640 L4540,660 L4520,680 L4500,700 L4480,720 L4460,740 L4440,760 L4420,780 L4400,800 L4380,820 L4360,840 L4340,860 L4320,880 L4300,900 L4280,920 L4260,940 L4240,960 L4220,980 L4200,1000 L4180,1020 L4160,1040 L4140,1060 L4120,1080 L4100,1100 L4080,1120 L4060,1140 L4040,1160 L4020,1180 L4000,1200 L3980,1220 L3960,1240 L3940,1260 L3920,1280 L3900,1300 L3880,1320 L3860,1340 L3840,1360 L3820,1380 L3800,1400 L3780,1420 L3760,1440 L3740,1460 L3720,1480 L3700,1500 L3680,1520 L3660,1540 L3640,1560 L3620,1580 L3600,1600 L3580,1620 L3560,1640 L3540,1660 L3520,1680 L3500,1700 L3480,1720 L3460,1740 L3440,1760 L3420,1780 L3400,1800 L3380,1820 L3360,1840 L3340,1860 L3320,1880 L3300,1900 L3280,1920 L3260,1940 L3240,1960 L3220,1980 L3200,2000 L3180,2020 L3160,2040 L3140,2060 L3120,2080 L3100,2100 L3080,2120 L3060,2140 L3040,2160 L3020,2180 L3000,2200 L2980,2220 L2960,2240 L2940,2260 L2920,2280 L2900,2300 L2880,2320 L2860,2340 L2840,2360 L2820,2380 L2800,2400 L2780,2420 L2760,2440 L2740,2460 L2720,2480 L2700,2500 L2680,2520 L2660,2540 L2640,2560 L2620,2580 L2600,2600 L2580,2620 L2560,2640 L2540,2660 L2520,2680 L2500,2700 L2480,2720 L2460,2740 L2440,2760 L2420,2780 L2400,2800 L2380,2820 L2360,2840 L2340,2860 L2320,2880 L2300,2900 L2280,2920 L2260,2940 L2240,2960 L2220,2980 L2200,3000 L2180,3020 L2160,3040 L2140,3060 L2120,3080 L2100,3100 L2080,3120 L2060,3140 L2040,3160 L2020,3180 L2000,3200 L1980,3220 L1960,3240 L1940,3260 L1920,3280 L1900,3300 L1880,3320 L1860,3340 L1840,3360 L1820,3380 L1800,3400 L1780,3420 L1760,3440 L1740,3460 L1720,3480 L1700,3500 L1680,3520 L1660,3540 L1640,3560 L1620,3580 L1600,3600 L1580,3620 L1560,3640 L1540,3660 L1520,3680 L1500,3700 L1480,3720 L1460,3740 L1440,3760 L1420,3780 L1400,3800 L1380,3820 L1360,3840 L1340,3860 L1320,3880 L1300,3900 L1280,3920 L1260,3940 L1240,3960 L1220,3980 L1200,4000 L1180,4020 L1160,4040 L1140,4060 L1120,4080 L1100,4100 L1080,4120 L1060,4140 L1040,4160 L1020,4180 L1000,4200 L980,4220 L960,4240 L940,4260 L920,4280 L900,4300 L880,4320 L860,4340 L840,4360 L820,4380 L800,4400 L780,4420 L760,4440 L740,4460 L720,4480 L700,4500 L680,4520 L660,4540 L640,4560 L620,4580 L600,4600 L580,4620 L560,4640 L540,4660 L520,4680 L500,4700 L480,4720 L460,4740 L440,4760 L420,4780 L400,4800 L380,4820 L360,4840 L340,4860 L320,4880 L300,4900 L280,4920 L260,4940 L240,4960 L220,4980 L200,5000 L180,5020 L160,5040 L140,5060 L120,5080 L100,5100 L80,5120 L60,5140 L40,5160 L20,5180 L10,5200 L20,5180 L40,5160 L60,5140 L80,5120 L100,5100 L120,5080 L140,5060 L160,5040 L180,5020 L200,5000 L220,4980 L240,4960 L260,4940 L280,4920 L300,4900 L320,4880 L340,4860 L360,4840 L380,4820 L400,4800 L420,4780 L440,4760 L460,4740 L480,4720 L500,4700 L520,4680 L540,4660 L560,4640 L580,4620 L600,4600 L620,4580 L640,4560 L660,4540 L680,4520 L700,4500 L720,4480 L740,4460 L760,4440 L780,4420 L800,4400 L820,4380 L840,4360 L860,4340 L880,4320 L900,4300 L920,4280 L940,4260 L960,4240 L980,4220 L1000,4200 L1020,4180 L1040,4160 L1060,4140 L1080,4120 L1100,4100 L1120,4080 L1140,4060 L1160,4040 L1180,4020 L1200,4000 L1220,3980 L1240,3960 L1260,3940 L1280,3920 L1300,3900 L1320,3880 L1340,3860 L1360,3840 L1380,3820 L1400,3800 L1420,3780 L1440,3760 L1460,3740 L1480,3720 L1500,3700 L1520,3680 L1540,3660 L1560,3640 L1580,3620 L1600,3600 L1620,3580 L1640,3560 L1660,3540 L1680,3520 L1700,3500 L1720,3480 L1740,3460 L1760,3440 L1780,3420 L1800,3400 L1820,3380 L1840,3360 L1860,3340 L1880,3320 L1900,3300 L1920,3280 L1940,3260 L1960,3240 L1980,3220 L2000,3200 L2020,3180 L2040,3160 L2060,3140 L2080,3120 L2100,3100 L2120,3080 L2140,3060 L2160,3040 L2180,3020 L2200,3000 L2220,2980 L2240,2960 L2260,2940 L2280,2920 L2300,2900 L2320,2880 L2340,2860 L2360,2840 L2380,2820 L2400,2800 L2420,2780 L2440,2760 L2460,2740 L2480,2720 L2500,2700 L2520,2680 L2540,2660 L2560,2640 L2580,2620 L2600,2600 L2620,2580 L2640,2560 L2660,2540 L2680,2520 L2700,2500 L2720,2480 L2740,2460 L2760,2440 L2780,2420 L2800,2400 L2820,2380 L2840,2360 L2860,2340 L2880,2320 L2900,2300 L2920,2280 L2940,2260 L2960,2240 L2980,2220 L3000,2200 L3020,2180 L3040,2160 L3060,2140 L3080,2120 L3100,2100 L3120,2080 L3140,2060 L3160,2040 L3180,2020 L3200,2000 L3220,1980 L3240,1960 L3260,1940 L3280,1920 L3300,1900 L3320,1880 L3340,1860 L3360,1840 L3380,1820 L3400,1800 L3420,1780 L3440,1760 L3460,1740 L3480,1720 L3500,1700 L3520,1680 L3540,1660 L3560,1640 L3580,1620 L3600,1600 L3620,1580 L3640,1560 L3660,1540 L3680,1520 L3700,1500 L3720,1480 L3740,1460 L3760,1440 L3780,1420 L3800,1400 L3820,1380 L3840,1360 L3860,1340 L3880,1320 L3900,1300 L3920,1280 L3940,1260 L3960,1240 L3980,1220 L4000,1200 L4020,1180 L4040,1160 L4060,1140 L4080,1120 L4100,1100 L4120,1080 L4140,1060 L4160,1040 L4180,1020 L4200,1000 L4220,980 L4240,960 L4260,940 L4280,920 L4300,900 L4320,880 L4340,860 L4360,840 L4380,820 L4400,800 L4420,780 L4440,760 L4460,740 L4480,720 L4500,700 L4520,680 L4540,660 L4560,640 L4580,620 L4600,600 L4620,580 L4640,560 L4660,540 L4680,520 L4700,500 L4720,480 L4740,460 L4760,440 L4780,420 L4800,400 L4820,380 L4840,360 L4860,340 L4880,320 L4900,300 L4920,280 L4940,260 L4960,240 L4980,220 L5000,200 L5020,180 L5040,160 L5060,140 L5080,120 L5100,100 L5120,80 L5140,60 L5160,40 L5180,20 L5200,0 L5220,20 L5240,40 L5260,60 L5280,80 L5300,100 L5320,120 L5340,140 L5360,160 L5380,180 L5400,200 L5420,220 L5440,240 L5460,260 L5480,280 L5500,300 L5520,320 L5540,340 L5560,360 L5580,380 L5600,400 Z";

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
      5600;
    const y =
      ((ALGERIA_BOUNDS.maxLat - lat) /
        (ALGERIA_BOUNDS.maxLat - ALGERIA_BOUNDS.minLat)) *
      6000;
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
                viewBox="0 0 5600 6000"
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
                <rect width="5600" height="6000" fill="url(#grid)" />

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
                            ? "fill-amber-400"
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
