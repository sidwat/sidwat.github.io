import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import MotionStudies from "@/components/MotionStudies";
export const metadata:Metadata={title:"Motion studies",robots:{index:false,follow:false}};
export default function Page(){return <div className="page-shell detail-page"><PageHeader label="Design preview" title="Motion studies" intro="Three quiet ways to bring the background to life. Compare them before choosing a final direction."/><MotionStudies/></div>;}
