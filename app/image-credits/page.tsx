import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
export const metadata:Metadata={title:"Image credits"};
const credits=[
 ["Geisel Library, UCSD","Belis@rio","Geisel_Library,_UCSD.jpg","by-sa/2.0","CC BY-SA 2.0"],
 ["A building at IIT Kanpur","Johannes Bader","A_building_at_IIT_Kanpur.jpg","by/2.0","CC BY 2.0"],
 ["Fronalpstock panorama","Hannes Röst","Fronalpstock_big.jpg","by-sa/3.0","CC BY-SA 3.0"],
 ["JPEG compression comparison","JJ Harrison; comparison by Ibrahim.ID","JPEG_compression_Example.jpg","by-sa/3.0","CC BY-SA 3.0"],
 ["Flower compression sample","CFCF","Flower_example_JPG2.jpeg","by-sa/4.0","CC BY-SA 4.0"],
];
export default function Page(){return <div className="page-shell detail-page"><PageHeader label="Photography" title="Image credits" intro="Campus photographs and illustrative image-processing samples used on this site."/><p className="prose-body mt-6">Project-card pictures illustrate image detail and compression. They are not outputs from the described research. Images are displayed with responsive cropping; downloaded files are otherwise unchanged.</p><ul className="mt-10 space-y-8">{credits.map(([title,author,file,license,label])=><li key={file}><h2 className="text-xl font-semibold">{title}</h2><p className="prose-body">{author} · <a href={`https://commons.wikimedia.org/wiki/File:${file}`}>Source</a> · <a href={`https://creativecommons.org/licenses/${license}/`}>{label}</a></p></li>)}</ul></div>;}
