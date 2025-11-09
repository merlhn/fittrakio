export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle outline */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        stroke="currentColor" 
        strokeWidth="3" 
      />
      
      {/* Wavy line inside circle - smooth wave from left to right */}
      <path
        d="M 20 50 Q 30 30, 40 50 Q 50 70, 60 50 Q 70 30, 80 50"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

