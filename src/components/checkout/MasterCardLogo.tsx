import type { SVGProps } from 'react';

export default function MasterCardLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#EA001B"/>
      <circle cx="26" cy="12" r="12" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
  );
}