# VELOURA: MERN Clothing Store (Demo, v1.1)

Poora MERN clothing store: customer side, order lena, admin panel, order tracking, backup aur restore.
Brand ka naam, logo aur products demo ke hain. Asli brand mile to sirf data badalna hai.

- **Frontend:** React (Vite), React Router, Framer Motion
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)

---

## 1. Data kahan rehta hai (sab se zaroori baat)

Orders aur products **MongoDB Atlas** mein save hote hain. Backend sirf beech ka server hai.
Is liye backend so jaye, band ho jaye ya dobara deploy ho, **purana data Atlas mein mehfooz rehta hai**.
Backend ke band hone se sirf ye hota hai ke naye orders aur admin panel us waqt tak kaam nahi karte jab tak backend wapas na aa jaye.

## 2. Free hosting ki asliyat (official docs ke mutabiq)

Koi code free hosting ki limits khatam nahi kar sakta. Ye limits samajh lein:

| Service | Kya hota hai |
|---|---|
| **Render free web service** | 15 minute koi visitor na aaye to server so jata hai. Agli request par jagne mein takreeban ek minute lagta hai. Har workspace ko mahine ke 750 free ghante milte hain, khatam hone par free services mahine ke aakhir tak band. Local files restart par ud jati hain. Email ke SMTP ports (25, 465, 587) band hain. |
| **Atlas free cluster** | 30 din koi activity na ho to cluster pause ho jata hai. Pause se 7 din pehle aur pause ke baad aap ko email aati hai. Pause ke dauran connections band rehte hain jab tak aap resume na karein. Atlas ke docs lambe arsay ke liye data export karne ki salah dete hain. |

**Meri salah:** demo aur dikhane ke liye free plan theek hai. Asli business jis par orders ka daromadar ho, uske liye backend paid plan par rakhein.

**Dhyan dein:** Render ke 750 ghante poore workspace ke hain. Ek service poora mahina jagi rahe to takreeban 744 ghante lagte hain (31 din x 24). Agar aap portfolio ka backend aur ye store dono ek hi workspace mein jagaye rakhengi to 750 se zyada ho jayenge. Ek hi ko jagaye rakhein, ya store wale ko paid plan par rakhein.

## 3. Is version mein kya protection lagi hai

**Backend:**
- Database na mile to server band nahi hota, khud dobara koshish karta rehta hai. Tab tak saaf "reconnecting" jawab deta hai.
- `/api/health` endpoint: uptime monitor yahan ping karta hai, ye database bhi check karta hai.
- Double order se bachao: network atakne par retry ho to ek hi order banta hai.
- Stock atomic hai: aakhri piece ek hi customer ko milta hai. Order cancel karne par stock wapas aa jata hai.
- Rate limiting (spam orders aur login guessing ke khilaf), security headers.
- Production mein default admin password se login band, aur `JWT_SECRET` ke baghair server start nahi hota.
- Naye order par aap ko Telegram ya email (optional, section 6).

**Frontend:**
- Website khulte hi server ko jagane ka ping jata hai, aur customer ko "warming up" ka message dikhta hai.
- Server soya ho ya band, products ki **static copy (snapshot)** turant dikhti hai. Customer browse kar sakta hai.
  Order tab hi hota hai jab live server jawab de.
- Checkout khud retry karta hai (server jagne ka intezar).
- Customer apna order **/track** page par order number aur phone se dekh sakta hai.
- Shipping, Returns, Privacy aur Terms ke pages (demo text hai, brand apni policy se badle).

**Admin panel:** "Download orders (CSV)" aur "Download full backup (JSON)" buttons.

## 4. Local par chalana

### Backend
```bash
cd server
npm install
cp .env.example .env     # Windows: copy .env.example .env
```
`.env` mein ye set karein:
- `MONGO_URI`: Atlas string, `.net/` ke baad `veloura_store` likhein
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: admin login
- `JWT_SECRET`: koi lamba random text

```bash
npm run seed             # 14 demo products
npm run dev              # http://localhost:5000
```

### Frontend (naye terminal mein)
```bash
cd client
npm install
npm run dev              # http://localhost:5173
```
Admin: `http://localhost:5173/admin/login`

## 5. Live karna (deploy)

### Backend (Render)
1. Code GitHub par daalein (`.env` aur `backups` nahi jate, `.gitignore` mein hain).
2. Render par naya **Web Service** banayein, root folder `server`, build command `npm install`, start command `npm start`.
3. Environment variables:

| Variable | Kya likhna hai |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Atlas string (`.../veloura_store?...`) |
| `CLIENT_URL` | Frontend ka address, jaise `https://yourstore.com` (kai hon to comma se) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Mazboot email aur password |
| `JWT_SECRET` | Lamba random text |

4. Atlas mein **Network Access** mein `0.0.0.0/0` allow rakhein (Render ka IP badalta rehta hai).

### Frontend (Vercel ya Netlify)
1. Live karne se pehle products ki taaza copy banayein: `cd server && npm run snapshot`.
2. Root folder `client`, build command `npm run build`, output `dist`.
3. Environment variable: `VITE_API_URL` = `https://your-backend.onrender.com/api`
4. Domain apne frontend se jodein (HTTPS khud lag jata hai). `vercel.json` aur `public/_redirects` pehle se maujood hain, taake `/shop` jaise links refresh par kaam karein.

### Server ko jagaye rakhna (free plan par)
- **Behtar tareeqa:** koi free uptime monitor (jaise UptimeRobot) lagayein jo har **5 minute** (ya jo bhi minimum free plan de, 15 minute se kam) `https://your-backend.onrender.com/api/health` kholta rahe.
  Render ke docs ke mutabiq 15 minute ke andar traffic ho to server nahi sota. Ye endpoint database ko bhi chhoota hai.
  Atlas ne docs mein ye saaf nahi likha ke kaun si activity "activity" ginti hai, is liye backup phir bhi lazmi hai.
- Monitor aap ko email bhi karta hai agar server ya database down ho.
- Optional: `SELF_URL` mein backend ka apna address likhein, to server khud ko har 13 minute ping karta hai.

## 6. Naye order ki khabar (bohat zaroori)

Order sirf admin panel mein aata hai, aap ko khud nahi batata. Is liye ye lagayein (dono optional, dono ek saath bhi chal sakte hain):

**Telegram (free, phone par foran):**
1. Telegram mein `@BotFather` se `/newbot` karein, aap ko token milega, `TELEGRAM_BOT_TOKEN` mein daalein.
2. Apne naye bot ko koi message bhejein.
3. Browser mein `https://api.telegram.org/bot<TOKEN>/getUpdates` kholein, jawab mein `"chat":{"id":...}` ka number `TELEGRAM_CHAT_ID` mein daalein.

**Email:**
1. resend.com par account banayein aur API key lein, `RESEND_API_KEY` mein daalein.
2. `NOTIFY_EMAIL` mein apni email likhein.
3. Default sender (`onboarding@resend.dev`) aam taur par sirf aap ki apni email par bhej sakta hai. Kisi aur ko bhejna ho to apna domain verify karna hota hai.
   Email SMTP se nahi, HTTPS API se jati hai, kyunke Render free plan SMTP ports band rakhta hai.

Notification fail ho jaye to bhi order save rehta hai.

## 7. Backup aur restore (har hafte ya mahine)

```bash
cd server
npm run backup           # server/backups/backup-....json
```
- Ye file aap ke computer par banti hai (Render par local files udd jati hain).
- Isme customers ka naam, phone aur address hota hai. Isay private rakhein, GitHub par na daalein.
- Admin panel se bhi "Download full backup (JSON)" aur "Download orders (CSV)" mil jate hain (CSV Excel mein khulti hai).

Data wapas dalna (naye ya purane cluster mein, `.env` ki `MONGO_URI` par):
```bash
npm run restore -- backups/backup-XXXX.json
```
Jo document pehle se maujood ho wo skip hota hai, kuch overwrite nahi hota.

**Atlas pause ho jaye:** Atlas ki email aayegi. Atlas mein jaakar cluster resume karein. Server khud dobara connect ho jata hai.

## 8. Brand ke liye kya badalna hai

| Cheez | Kahan |
|---|---|
| Brand naam, tagline, email, phone | `client/src/brand.js` |
| Logo | `client/src/components/Logo.jsx` |
| Colors | `client/src/index.css` ke top par `:root` |
| Page title | `client/index.html` |
| Shipping charges, free shipping limit | `client/src/config.js` **aur** `server/config.js` (dono mein same) |
| Policy pages ka text | `client/src/pages/Policy.jsx` |
| Products | Admin panel se, ya `server/seed.js` |

**Asli photos:** admin panel mein product edit karein aur "Image URL" mein link daalein (Cloudinary jaisi image hosting par upload karke).
Products badalne ya photos lagane ke baad `npm run snapshot` dobara chalayein aur frontend dobara deploy karein.

## 9. Abhi shamil nahi
- Online payment (card, JazzCash, Easypaisa): brand ka merchant account aur gateway integration chahiye.
- Customer accounts (abhi guest checkout hai).
- Product photos ki direct upload (abhi link se).

## Sources
- Render free tier: https://render.com/docs/free
- Atlas free cluster pause: https://mongodb.com/docs/atlas/pause-terminate-cluster/
