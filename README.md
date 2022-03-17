# Burn-NFT-UI

A UI for burning Solana NFTs and geting back $SOL from the associated token account.




https://user-images.githubusercontent.com/35653371/157632711-68911aa8-0028-46d7-b836-5b192cc6d2ef.mp4






## Demo: https://burn-nft-ui.vercel.app/


## Getting Started

Clone the repo, install the dependencies and run `yarn run dev` to run the development server.

```bash
git clone https://github.com/cryptoloutre/burn-nft-ui.git
cd burn-nft-ui
yarn install
yarn run dev
```


## Style

[Tailwind CSS](https://tailwindcss.com/) or [daisyUI](https://daisyui.com/) are selected tools for rapid style development.

You can quickly change theme changing `daisy.themes` within `./tailwind.config.js`.
More info here: https://daisyui.com/docs/default-themes

This app encourage you to use CSS Modules over other style technics (like SASS/LESS, Styled Components, usual CSS).
It have modular nature and supports modern CSS. [Read more on Next.JS site](https://nextjs.org/docs/basic-features/built-in-css-support).
Anyway, if you want to connect LESS there is example code in `./next.config.js`

## Deploy on Vercel

Before push run localy `npm run build` to make sure app can be build succesffully on vercel .

Vercel will automatically create environment and deployment for you if you have vercel account connected to your GitHub account. Go to the vercel.com to connect it.
Then any push to `main` branch will automatically rebuild and redploy app.

To deploy on Vercel use the following settings :

<p align="center">
<img src="https://user-images.githubusercontent.com/35653371/157638049-4944f065-5985-4a35-bbe6-e46efc984737.png"/>
</p>


## Community
If you have questions or any troubles, feel free to reach me on Twitter [@laloutre](https://twitter.com/laloutre).


## Tips
Donations can be made at `6MupHwVuaZnxeXbw2DEvH96ouaWdg5TygPaSruB4H7YG` if you are feeling generous and want to support me!
