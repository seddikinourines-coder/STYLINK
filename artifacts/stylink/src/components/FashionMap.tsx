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

// Authentic Algeria map bounds for the SVG path
const SVG_BOUNDS = {
  minX: 45.7,
  maxX: 954.3,
  minY: 45.5,
  maxY: 954.5,
};

// Real geographic bounds of Algeria
const GEO_BOUNDS = {
  minLng: -8.7,
  maxLng: 12.0,
  minLat: 18.9,
  maxLat: 37.5,
};

// Authentic Algeria map shape from simplemaps.com
const ALGERIA_PATH = [
  "M215.6,668.8L207.9,663.6L200.3,658.4L192.7,653.2L185.0,647.9L179.7,644.5L178.6,643.8L172.3,639.7L164.9,634.9L157.6,630.0L150.2,625.2L141.5,619.5L132.8,613.8L124.1,608.1L115.4,602.4L106.7,596.7L97.9,591.0L89.2,585.2L80.5,579.5L71.8,573.8L63.1,568.0L54.4,562.3L45.7,556.5L45.7,551.8L45.7,547.2L45.7,542.5L45.7,537.9L45.7,534.9L45.7,531.9L45.7,528.9L45.7,525.9L45.7,522.9L45.7,520.0L45.7,517.0L45.7,514.0L45.7,511.0L45.7,508.0L45.7,505.0L45.7,502.0L45.7,499.0L45.7,496.0L45.7,493.0L45.7,490.0L45.7,487.7L45.9,486.4L46.4,485.4L47.2,484.7L52.8,481.6L54.8,480.1L56.8,478.9L57.3,478.4L58.9,475.7L59.5,475.1L61.1,474.4L61.8,474.0L64.7,471.2L67.7,469.2L72.7,467.0L74.1,465.9L78.1,462.1L82.8,458.9L85.5,456.4L87.6,455.3L88.3,454.7L91.0,452.0L92.5,451.3L94.5,451.4L96.5,451.7L97.5,451.8L98.4,451.7L99.3,451.3L104.3,451.6L108.3,447.4L113.3,445.3L116.6,444.9L121.6,445.3L129.2,448.4L132.9,444.9L139.1,444.2L145.5,442.4L151.7,441.7L158.2,441.7L163.7,441.7L168.9,440.7L174.4,440.0L176.0,444.6L179.7,446.0L184.0,444.6L188.6,438.5L192.6,432.2L195.7,426.2L200.0,421.5L204.6,418.3L209.5,414.1L213.2,411.2L217.8,408.7L224.3,405.9L230.4,400.9L235.3,394.5L239.6,392.0L244.9,390.6L251.6,390.2L259.0,388.4L267.3,384.1L267.0,380.9L266.7,377.7L268.8,375.5L271.3,371.6L268.9,367.7L268.9,366.7L268.7,365.8L268.3,364.9L267.7,364.4L266.1,363.6L265.4,362.9L264.2,360.9L263.5,360.3L262.8,360.1L262.1,360.4L260.8,361.6L260,362.0L259.3,361.9L258.8,361.5L258.6,360.6L258.9,359.6L259.9,358.0L259.9,356.8L259.7,352.9L259.8,352.0L260.4,351.3L262.8,349.5L266.1,349.3L266.7,336.0L269.7,334.4L271.6,334.8L273.2,334.7L286.1,332.4L295.6,329.5L303.3,328.4L301.4,323.3L298.4,315.2L300.9,313.8L309.1,313.1L317.0,310.9L323.0,311.1L325.8,311.3L329.0,311.4L332.4,311.6L336.1,311.8L339.9,311.9L343.8,312.1L347.6,312.3L351.4,312.5L355.0,312.7L358.4,312.8L361.4,313.0L364.1,313.1L366.3,313.2L368,313.3L369,313.3L369.4,313.3L372.7,313.5L374.5,313.1L375.3,311.2L375.1,310.1L374.4,309.5L373.5,309.2L372.6,309.2L371.0,309.9L370.3,309.9L370.1,309.0L370.3,308.7L371.0,308.1L371.3,307.9L371.5,307.3L371.6,306.9L371.6,306.4L371.7,305.8L372.4,301.1L373.0,299.2L373.4,298.3L374.1,297.3L374.8,296.9L376.7,296.7L378.3,296.0L379.7,294.9L382.3,292.0L381.6,290.8L369.3,281.3L366.5,280.3L365.1,279.1L359.1,269.0L361.0,267.7L361.3,267.3L361.6,266.9L361.8,266.4L361.9,265.9L362.0,264.7L362.0,263.5L361.7,262.4L361.0,261.7L359.7,260.7L358.6,259.7L357.7,258.4L357.1,256.7L356.3,255.2L354.0,253.1L353.6,251.3L353.6,246.1L354.1,244.8L354.7,243.5L355.5,240.5L356.2,239.6L356.7,238.1L356.5,236.4L354.6,231.6L354.1,231.0L353.3,230.4L351.8,229.9L351.1,229.4L350.8,228.6L351.0,227.8L351.5,227.2L352.0,226.8L352.4,226.2L352.8,225.4L352.8,224.8L352.3,223.3L351.9,220.7L352.1,218.2L354.1,209.7L354.2,208.6L354.1,207.9L354.0,207.2L350.9,197.4L349.8,195.0L348.1,193.0L352.8,187.3L352.3,187.0L350.7,186.5L345.4,181.0L345.7,180.1L348,176.5L349.1,174.1L349.7,173.7L349.8,173.3L349.0,172.5L344.4,169.5L342.9,168.1L340.6,166.6L340,165.9L339.8,165.2L339.7,164.4L339.5,163.8L339,163.4L337,163.2L335.5,162.2L334.2,160.9L332.5,159.7L331.2,159.2L330.4,158.2L330,156.7L329.9,154.6L330.9,154.2L331.1,154.3L331.2,154.3L331.4,154.4L331.5,154.6L332.8,154.0L334.3,154.3L335.9,155.0L337.4,155.4L340.2,155.0L341.3,155.3L341.6,155.4L341.9,155.3L342.7,154.6L346.8,153.4L347.9,152.6L348.3,152.5L349.6,152.6L350.2,152.4L350.9,151.9L352.3,150.2L355.2,149.3L355.6,149.0L356.0,148.0L361.3,143.5L362.1,143.2L366.3,142.8L367.4,142.4L367.7,142.3L367.9,142.1L369.1,140.6L369.9,140.4L370.7,139.8L371.4,139.1L371.9,138.4L372.3,137.3L372.8,134.8L373.3,133.8L373.8,132.9L375.3,128.9L375.6,128.3L376.2,128.1L377.2,128.0L377.4,127.8L378.6,126.2L379.0,125.8L380.1,125.0L381.4,123.8L381.9,122.9L382.3,122.6L383.9,122.2L384.7,121.7L385.4,121.0L386.1,120.6L387.1,120.3L387.7,120.3L387.9,120.8L388.1,121.0L388.7,120.8L390.3,119.8L391.4,117.9L392.4,117.6L392.8,117.9L393.1,118.2L393.5,118.6L394.1,118.8L394.5,118.8L395.4,119.1L395.9,119.2L396.4,119.3L396.6,119.7L396.8,120.2L397.2,120.6L397.7,120.7L399.3,120.6L400.1,120.4L401.0,120.0L401.8,119.3L402.3,117.8L402.8,117.7L403.4,117.9L403.9,118.0L404.4,117.7L404.7,117.3L406.7,113.0L406.8,112.4L406.7,112.3L406.6,111.9L406.5,111.6L406.6,111.3L406.9,111.3L407.1,111.4L407.3,111.6L407.5,111.7L407.9,111.7L408.9,111.7L409.3,111.7L411.2,110.8L412.4,110.4L412.9,110.8L413.1,111.4L413.6,111.7L414.1,111.8L414.4,112.0L414.6,112.6L414.3,113.3L414.4,113.9L415.1,114.7L416.3,115.3L419.4,115.9L421.3,116.8L422.3,116.9L422.7,116.8L424.0,116.5L426.0,115.5L427.8,114.2L429.2,112.8L430.8,109.6L431.2,108.2L432.7,104.8L433.1,103.6L433.1,102.9L433.3,102.6L433.7,102.3L434.1,102.1L434.5,101.8L436.6,99.6L437.4,99.0L440.2,98.0L440.7,97.7L440.9,97.3L441.8,96.7L442.2,96.4L442.3,95.9L442.6,94.6L442.8,94.2L443.5,93.7L444.6,93.5L446.6,93.4L447.6,93.2L448.3,92.7L449.0,92.1L452.2,89.9L453.9,89.4L454.6,88.7L455.3,88.0L456.0,87.4L456.9,87.2L460.3,87.0L460.8,86.9L461.5,86.6L463.0,85.5L465.7,84.8L466.4,84.3L466.9,83.8L467.9,83.1L468.4,82.6L468.6,82.1L468.7,81.7L468.9,81.2L469.3,80.7L470.1,80.4L472.0,",
  "79.9L473.7,78.8L476.8,78.8L477.8,78.4L479.6,77.5L480.6,77.3L482.5,77.3L483.4,77.2L484.4,76.9L487.0,75.6L487.9,75.5L488.7,75.6L490.6,76.3L491.6,76.6L492.7,76.5L494.5,76.0L502.5,75.5L503.2,75.5L503.7,75.4L504.7,74.8L505.2,74.7L505.6,74.8L506.5,75.1L507.0,75.1L509.4,74.4L511.9,74.2L514.0,74.7L514.5,74.7L518.3,74.2L529.3,70.9L530.2,70.6L531.2,70.5L532.1,70.8L532.9,71.3L533.2,71.8L533.3,72.3L533.5,72.7L534.0,72.8L534.5,72.9L535.4,73.1L535.8,73.2L542.1,72.8L543.5,72.3L547.7,69.0L550.6,67.5L551.7,66.5L552.8,64.9L553.1,64.2L554.2,63.0L556.8,61.2L558.7,60.8L559.0,60.8L560.3,61.0L561.8,61.9L562.9,63.2L564.2,64.3L565.9,64.8L567.3,64.8L567.6,64.8L569.0,64.0L569.4,63.2L569.6,62.4L569.7,61.0L570.2,60.9L573.0,62.3L574.7,62.7L580.0,63.0L580.8,62.9L582.5,62.4L583.4,62.3L583.9,62.1L584.2,61.8L584.5,61.4L584.8,61.2L585.2,61.1L586.2,61.2L586.6,61.2L588.3,60.3L590.9,57.6L592.3,56.6L596.1,55.4L598.1,55.2L599.8,55.5L601.4,56.5L602.1,56.6L602.6,56.6L603.5,56.3L605.1,56.3L605.4,56.3L607.5,56.6L608.3,57.0L610.1,56.0L610.7,55.9L611.2,56.0L612.4,56.5L612.9,56.6L613.5,56.5L614.7,55.7L615.2,55.5L615.9,55.6L617.2,56.1L617.8,56.2L623.1,55.5L623.6,55.6L624.3,55.8L624.9,56.1L625.3,56.4L625.9,56.7L627.3,56.8L627.9,57.0L629.3,56.4L629.7,56.4L631.1,56.3L634.4,56.6L637.5,56.2L638.3,56.4L645.5,59.4L646.3,60.2L646.5,60.6L647.1,60.7L647.7,60.7L648.1,60.8L648.4,61.0L648.8,61.7L649.0,61.9L649.7,62.3L650.6,62.5L651.5,62.7L652.3,62.7L651.4,65.3L651.7,66.2L652.9,67.2L658.1,69.8L659.5,70.2L661.1,70.3L664.1,69.8L666.5,69.1L666.8,69.0L668.1,69.0L668.3,68.9L668.9,68.2L669.2,67.9L671.0,67.3L671.8,66.6L672.4,64.6L673.0,63.8L673.8,63.1L674.6,62.7L676.5,62.1L677.4,61.7L678.9,60.2L680.0,59.9L681.1,59.8L684.1,60.4L685.9,60.4L693.3,58.7L700.4,56.0L702.1,55.0L703.0,53.6L703.1,52.5L702.9,51.6L702.9,50.7L703.4,49.7L703.8,49.3L705.5,48.0L706.2,47.2L706.6,46.8L708.0,46.0L710.0,45.5L712.0,45.5L713.8,46.1L715.4,47.3L715.6,47.4L715.6,48.0L715.8,48.4L716.0,48.6L716.4,48.7L716.9,49.1L717.3,51.2L718.1,52.1L718.7,51.9L719.5,52.2L720.3,52.6L721.2,52.9L727.9,53.2L728.4,53.4L729.2,53.9L729.9,54.5L730.4,55.1L730.4,56.0L731.7,56.5L733.4,56.7L734.6,56.6L738.5,55.4L739.7,54.7L740.4,55.0L741.5,55.3L742.6,55.3L743.1,54.9L743.4,54.4L745.3,52.8L745.9,52.5L746.2,52.2L746.6,51.6L746.9,50.9L747.0,50.4L746.9,49.8L746.7,49.4L745.0,47.5L743.7,46.4L743.7,46.1L744.2,46.0L745.0,45.7L745.5,45.7L745.9,45.8L746.7,46.3L747.1,46.4L747.2,46.4L747.4,46.5L747.6,46.7L747.8,46.8L748.0,46.6L748.4,46.2L748.6,46.1L748.8,46.1L749.2,46.2L750.0,46.7L750.5,46.8L750.8,46.7L752.0,46.1L752.6,46.1L752.7,46.1L752.7,46.3L753.0,46.8L753.2,47.4L753.5,47.8L754.1,47.9L755.0,48.0L755.4,48.1L755.7,48.3L756.5,47.9L757.3,47.6L758.8,48.8L760.1,50.2L761.6,51.3L763.6,51.7L764.0,51.6L764.4,51.4L764.8,51.3L765.4,51.4L765.9,51.6L766.3,51.9L766.7,52.3L767.0,52.7L769.2,52.5L769.6,52.3L770.4,51.4L770.8,51.0L770.5,52.1L769.9,53.3L769.7,54.4L770.5,55.1L769.7,56.7L771.3,57.9L773.8,58.6L775.7,58.9L781.9,57.4L782.9,56.8L783.8,56.0L789.9,52.9L790.7,53.5L791.5,54.3L792.4,54.7L794.3,54.6L795.3,54.7L796.1,55.1L796.8,54.9L797.3,55.1L797.9,55.6L798.5,55.9L800.1,56.1L801.6,55.9L806.2,54.0L806.3,55.4L806.3,56.1L806.4,56.6L807.9,59.0L807.9,59.6L807.1,60.2L804.1,61.4L802.6,61.8L800.9,61.6L799.2,61.8L797.9,62.5L797.6,63.4L799.1,64.2L800.0,65.3L799.6,67.3L798.6,69.2L797.6,70.3L792.3,73.5L789.5,74.6L788.2,75.4L787.2,76.7L787.1,78.5L787.1,78.6L788.9,79.3L792.7,79.8L793.5,80.2L794.4,80.5L795.0,80.9L795.4,81.9L795.5,82.9L795.4,85.2L795.3,86.0L795.3,86.2L793.2,92.1L793.0,94.3L793.2,95.4L793.5,96.4L793.6,97.4L793.2,98.5L792.7,99.4L791.8,103.4L791.7,106.4L791.5,107.0L790.6,110.4L790.3,114.7L790.5,117.0L791.0,118.9L793.2,122.5L793.9,124.2L794.1,125.9L794.5,130.4L794.5,132.0L792.9,135.9L792.4,137.7L792.3,139.7L792.6,141.9L793.6,143.8L795.3,144.7L797.1,145.2L798.7,146.4L798.2,147.5L795.6,151.6L793.5,153.9L792.9,155.8L792.1,159.7L791.1,162.6L790.6,164.7L790.7,166.7L791.5,172.1L791.4,172.8L791.1,173.3L791.0,173.4L789.6,174.9L789.1,175.7L788.9,176.5L790.1,178.3L789.7,178.9L788.2,179.9L787.9,180.3L787.6,181.3L787.4,181.6L787.0,182.0L786.0,182.6L784.2,184.2L783.8,184.6L779.6,186.5L777.8,187.8L774.0,189.5L772.3,190.8L771.4,192.6L769.7,198.9L769.4,199.8L768.8,200.5L768.0,200.9L765.2,201.4L763.5,202.2L762.3,203.5L761.2,204.9L759.4,206.8L758.4,207.8L757.8,209.2L757.7,213.1L756.8,218.4L757.0,220.5L757.6,223.4L757.9,224.3L759.2,226.8L759.6,229.5L760.0,230.9L762.8,235.8L766.2,241.7L766.2,244.0L766.9,250.9L767.6,253.4L768.7,254.7L770.3,255.1L772.4,255.3L774.0,255.9L778.9,259.4L779.8,259.9L780.7,260.2L781.6,260.2L782.5,260.0L783.5,260.6L787.7,267.1L792.1,274.1L792.7,275.8L793.3,283.2L793.3,288.6L794.3,290.3L795.5,291.7L800.9,295.1L807.9,300.2L817.1,306.9L824.6,312.3L825.2,313.0L825.7,314.0L826.5,317.7L826.6,318.3L827.8,324.0L829.1,329.7L830.3,335.4L831.6,341.0L832.8,346.7L834.1,352.4L835.3,358.1L836.6,363.7L837.8,369.4L839.1,375.0L840.3,380.7L841.6,386.3L842.8,391.9L844.0,397.5L845.3,403.1L846.5,408.8L836.3,414.4L837.3,416.1L839.9,419.2L842.2,422.0L847.9,430.4L853.1,440.3",
  "L856.5,452.4L860.0,464.5L861.0,472.2L861.1,481.7L860.1,490.1L857.9,507.7L858.4,510.6L864.9,527.6L864.8,529.6L864.6,530.0L861.7,540.0L860.9,540.9L859.7,541.6L858.6,542.4L858.7,543.4L859.4,544.6L859.8,545.6L859.5,546.5L857.6,548.6L856.9,549.7L856.4,552.6L855.6,554.6L855.4,555.4L855.4,556.2L859.1,569.4L860.0,574.5L860.4,575.5L860.9,575.9L862.9,577.0L863.6,577.6L863.7,578.4L862.6,583.6L862.5,585.3L863.0,586.7L863.1,587.7L861.3,594.0L860.4,595.0L844.9,602.5L844.9,603.5L844.7,604.3L844.3,605.0L842.8,606.4L842.0,608.4L841.4,609.2L840.3,611.5L841.3,614.2L847.5,622.9L854.2,632.3L859.6,639.9L866.3,649.3L868.0,652.4L868.6,655.5L868.8,661.9L869.0,668.8L869.1,675.5L869.6,676.8L876.2,680.6L877.0,682.0L877.8,686.5L878.3,688.1L879.1,689.0L884.9,693.7L885.7,694.0L887.5,693.9L892.6,691.9L897.5,690.1L898.4,690.0L899.4,690.2L907.8,693.0L918.3,696.5L932.2,701.1L934.0,701.7L935.5,702.5L936.6,704.0L939.7,710.2L942.8,716.7L942.9,716.9L947.8,726.9L950.9,733.2L954.3,740.1L951.3,742.0L948.3,743.9L945.3,745.8L942.3,747.8L939.3,749.7L936.3,751.6L933.3,753.5L930.3,755.5L927.3,757.4L924.4,759.3L921.4,761.2L918.4,763.1L915.4,765.1L912.4,767.0L909.4,768.9L906.4,770.8L903.4,772.7L900.4,774.6L897.4,776.5L894.4,778.5L891.4,780.4L888.4,782.3L885.4,784.2L882.4,786.1L879.4,788.0L876.5,789.9L873.5,791.8L870.5,793.7L867.5,795.7L864.5,797.6L861.5,799.5L858.5,801.4L855.5,803.3L852.5,805.2L849.5,807.1L846.5,809.0L843.5,810.9L840.5,812.8L837.5,814.7L834.5,816.6L831.5,818.5L828.6,820.4L825.6,822.3L822.6,824.2L819.6,826.1L816.6,828.0L813.6,829.9L810.6,831.8L807.6,833.7L804.6,835.6L801.6,837.5L798.6,839.4L795.6,841.3L792.6,843.2L789.6,845.1L786.6,847.0L783.6,848.9L780.6,850.8L777.7,852.7L774.7,854.6L771.7,856.5L768.7,858.3L765.7,860.2L762.7,862.1L756.9,865.8L752.6,869.6L749.4,872.3L746.3,875.1L743.1,877.8L740.0,880.5L736.6,883.5L734.9,885.0L732.4,887.3L729.6,889.9L726.8,892.4L724.1,895.0L721.3,897.5L718.5,900.0L715.7,902.6L713.0,905.1L710.2,907.7L707.4,910.2L704.7,912.7L701.9,915.3L699.1,917.8L696.3,920.3L693.6,922.9L690.8,925.4L688.0,927.9L684.5,931.1L682.6,932.4L680.7,933.2L675.0,934.4L670.6,935.2L661.0,937.2L651.3,939.2L646.9,940.0L638.6,941.7L630.3,943.4L622.0,945.1L613.7,946.8L606.2,948.3L598.7,949.7L594.5,950.6L591.2,951.2L583.7,952.7L579.0,953.6L575.5,954.5L574.3,954.5L573.7,954.4L573.3,954.3L572.2,953.6L569.6,951.0L567.6,950.2L566.7,949.6L565.8,948.9L565.0,948.2L564.3,947.1L564.2,946.3L564.6,945.4L565.3,944.4L565.6,943.5L565.8,943.1L566.4,942.7L567.4,941.7L567.6,940.9L567.8,939.1L568.2,938.2L569.0,937.5L569.9,937.0L570.7,936.4L571.2,935.3L571.1,934.3L570.6,933.5L570.0,932.8L569.6,932.0L569.6,931.5L569.9,930.6L569.9,930.3L569.7,929.9L569.5,929.7L569.3,929.6L569.0,929.3L568.5,927.6L568.4,925.8L569.2,916.4L569.1,915.7L568.4,915.1L567.8,914.8L566.2,914.3L565.4,914.0L562.9,911.9L557.3,909.5L545.3,906.9L542.8,906.8L538.8,906.0L538.3,906.0L537.5,905.8L535.9,904.9L535.0,904.6L534.0,904.3L533.3,904.1L532.8,903.6L531.0,900.3L529.6,898.3L528.0,896.5L525.3,894.4L524.5,893.9L523.7,893.7L522.8,893.8L521.8,894.5L520.0,896.2L518.8,896.7L518.2,896.7L515.4,895.7L515.0,895.4L514.6,895.1L514.3,894.9L513.7,894.8L513.1,895.0L512.4,895.7L511.9,895.9L510.9,895.9L510.6,895.3L510.4,894.4L510.0,893.4L509.3,892.9L508.6,892.9L507.8,893.0L506.9,892.9L505.9,892.5L500.7,888.1L500.3,887.4L500.3,883.9L500.0,882.2L499.1,880.9L496.3,878.7L494.6,877.8L493.0,877.5L492.2,877.0L491.4,876.8L489.6,876.5L487.7,875.9L487.0,875.3L486.3,874.5L485.4,872.8L484.8,872.3L483.7,872.0L482.8,872.1L481.0,872.4L480.1,872.4L479.1,872.3L478.5,872.1L478.2,871.5L478.1,870.3L478.1,869.4L479.1,865.1L479.6,860.0L479.5,858.9L478.7,855.9L478.1,855.0L473.0,851.4L469.2,848.7L465.4,846.0L461.6,843.3L457.7,840.7L453.9,838.0L450.1,835.3L446.3,832.6L442.5,829.9L438.7,827.3L434.9,824.6L431.1,821.9L427.9,819.6L427.2,819.2L423.4,816.5L419.6,813.8L415.8,811.1L412.0,808.5L408.2,805.8L404.4,803.1L400.6,800.4L396.7,797.7L392.9,795.0L389.1,792.3L385.3,789.6L381.5,786.9L377.7,784.2L373.9,781.5L370.1,778.8L366.2,776.1L362.4,773.4L358.6,770.7L354.8,768.0L351.0,765.3L347.2,762.6L343.4,759.9L339.6,757.1L335.8,754.4L331.9,751.7L328.1,749.0L324.3,746.3L320.5,743.6L316.7,740.9L312.9,738.1L309.1,735.4L305.3,732.7L301.4,730.0L297.6,727.3L293.8,724.5L290.0,721.8L286.5,719.3L283.0,716.8L279.5,714.3L276.0,711.8L272.5,709.3L269.0,706.7L265.5,704.2L262.0,701.7L258.4,699.2L254.9,696.7L251.4,694.2L247.9,691.6L244.4,689.1L240.9,686.6L240.9,686.6L237.4,684.1L233.9,681.6L229.0,678.0L225.7,675.7L222.3,673.4L218.9,671.1L215.6,668.8Z",
].join("");

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
      SVG_BOUNDS.minX +
      ((lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng)) *
        (SVG_BOUNDS.maxX - SVG_BOUNDS.minX);
    const y =
      SVG_BOUNDS.minY +
      ((GEO_BOUNDS.maxLat - lat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) *
        (SVG_BOUNDS.maxY - SVG_BOUNDS.minY);
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
                viewBox="0 0 1000 1000"
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
                  width="100"
                  height="100"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 100 0 L 0 0 0 100"
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                  />
                </pattern>
                <rect width="1000" height="1000" fill="url(#grid)" />

                {/* Algeria Map Path */}
                <path
                  d={ALGERIA_PATH}
                  fill="url(#mapGradient)"
                  stroke="#d97706"
                  strokeWidth="1"
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
                        cy={y + 10}
                        rx={isActive ? "15" : "10"}
                        ry="5"
                        fill="rgba(0,0,0,0.3)"
                        className="transition-all duration-300"
                      />

                      {/* 3D Pin Body */}
                      <path
                        d={`M${x},${y} c-8,-8 -12,-15 -12,-22 a12,12 0 1,1 24,0 c0,7 -4,14 -12,22z`}
                        fill={isActive ? "url(#pinGradientActive)" : "url(#pinGradientInactive)"}
                        className="transition-all duration-500 group-hover/pin:-translate-y-1"
                        style={{
                          filter: isActive
                            ? "drop-shadow(0 0 10px rgba(245, 158, 11, 0.6))"
                            : "none",
                        }}
                      />

                      {/* Pin Inner Circle */}
                      <circle
                        cx={x}
                        cy={y - 22}
                        r="5"
                        fill={isActive ? "#fff" : "rgba(255,255,255,0.5)"}
                      />

                      {/* Count Badge */}
                      <g transform={`translate(${x + 12}, ${y - 30})`}>
                        <circle
                          r="12"
                          fill={isActive ? "#f59e0b" : "#1e293b"}
                          stroke={isActive ? "#fff" : "#475569"}
                          strokeWidth="2"
                        />
                        <text
                          dy=".3em"
                          textAnchor="middle"
                          className="text-[10px] font-bold fill-white"
                          style={{ fontFamily: "serif" }}
                        >
                          {cluster.designers.length}
                        </text>
                      </g>

                      {/* City Label */}
                      <text
                        x={x}
                        y={y + 35}
                        textAnchor="middle"
                        className={`text-[12px] font-bold uppercase tracking-widest transition-all duration-300 ${
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
                      href={`/boutiques/${designer.id}`}
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
