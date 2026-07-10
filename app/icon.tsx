import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '128px',
          border: '8px solid rgba(32, 178, 170, 0.3)',
          position: 'relative',
        }}
      >
        {/* Outer White Nova Star */}
        <svg
          width="400"
          height="400"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute' }}
        >
          <path
            d="M256 64C256 182.26 182.26 256 64 256C182.26 256 256 329.74 256 448C256 329.74 329.74 256 448 256C329.74 256 256 182.26 256 64Z"
            fill="white"
          />
          {/* Inner Teal Core */}
          <path
            d="M256 192C256 238.99 218.99 256 176 256C218.99 256 256 273.01 256 320C256 273.01 293.01 256 336 256C293.01 256 256 238.99 256 192Z"
            fill="#20B2AA"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
