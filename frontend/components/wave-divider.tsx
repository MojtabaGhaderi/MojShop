// frontend/components/wave-divider.tsx
export default function WaveDivider({ flip = false }: { flip?: boolean }) {
    return (
        <div aria-hidden="true" className={flip ? 'rotate-180' : ''}>
            <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="h-6 w-full">
                <path
                    d="M0,12 C60,22 100,2 160,10 C220,18 260,4 320,10 C360,14 380,10 400,12 L400,24 L0,24 Z"
                    fill="var(--color-surface-elevated)"
                />
                <path
                    d="M0,12 C60,22 100,2 160,10 C220,18 260,4 320,10 C360,14 380,10 400,12"
                    fill="none"
                    stroke="var(--color-wave)"
                    strokeWidth="1"
                    opacity="0.4"
                />
            </svg>
        </div>
    );
}