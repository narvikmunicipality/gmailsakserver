# GmailSakServer
Server-koden som tilbyr API-ene som GmailSakAddon bruker.

### Sette opp VSCode for utvikling
- Installer git: https://git-scm.com/download/win
- Start cmd.exe
- “cd” til mappen du vil ha prosjektet liggende i
- git clone https://github.com/narvikmunicipality/gmailsakserver.git
- cd gmailsakserver
- code .
- View → Integrated Terminal
- .\build.ps1
- Tasks → Run Build Task... (eller trykk CTRL+ALT+B)
Hvis testene blir kjørt i terminal-vinduet så er alt OK og det er bare å sette i gang.

Under utvikling kan du kjøre serveren og få den til å omstarte automatisk når du gjør endringer i *.js-filer med *nodemon*:
`cd src`
`nodemon index.js`

> 🛈
Utviklingsversjonen av Gmailsak kan settes opp slik at den kontakter f.eks. en revers-proxy som peker mot en utviklingsmaskin.
Dette gjør at det er mulig å teste endringene underveis og umiddelbart under utvikling.

Når byggeskriptet, build.ps1, kjøres så lager den en zip-fil som legges i publish-mappen; denne inneholder alt som trengs for å kjøre en produksjonsversjon.
> ⚠ Husk å legge inn en ferdigkonfigurert .env-fil ellers vil det ikke bli generert en zip-fil.

#### Oppbygging
- *.vscode* - VS Code oppsett
- *node_modules* - npm-håndtert mappe.
- *spec* - All testkoden til prosjektet.
- *src* - Kildekoden til prosjektet.
  - *controllers* - Controller-ene som kontakter riktig tjeneste i koden og returnerer eventuelle verdier som blir generert til innkommende forespørsler.
  - *middleware* - Kode som kjører sjekker på innkommende forespørsler, f.eks. sjekke at OAuth2-koden er gyldig.
  - *routes/index.js* - Her knyttes URL-ene opp mot sine controllere.
  - *services* - Her ligger tjenestene som brukes for å hente/lagre data fra de forskjellige   systemene.
  - *static/images* - Ikon som brukes i Gmailsak.
  - *.env.example* - Utgangspunkt for konfigurasjonsfilen.
  - *config.js* - Konfigurasjonsobjekt for Gmailsak som blant annet henter verdiene fra *.env*.
  - *container.js* - "Dependency Injection Container"-en til GmailSak; her defineres alle   tjenestene som brukes rundt omkring i koden.
  - *index.js* - Wrapperen som syr sammen, konfigurerer og starter opp web-serveren.
- *tools* - Byggeskript/Cake-håndtert mappe.
- *.gitignore* - Ignorerte filer/mapper som ikke skal inn i Git.
- *build.cake* - Byggeskript-implementasjonen i C#.
- *build.ps1* - Cake-byggeskript-wrapper; kjør denne for å starte byggeskriptet.
- *Gmailsak.Log.sql* - SQL-script for oppretting av loggtabellen som Gmailsak skriver metadata til når noen importerer eller får feil under import.
- *package-lock.json* - Metadata om installerte pakker i npm.
- *package.json* - npm-informasjon om prosjektet og hvilke pakker den er avhengig av.