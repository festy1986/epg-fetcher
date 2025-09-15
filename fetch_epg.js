// -------------------- Required Modules --------------------
const axios = require('axios');
const iconv = require('iconv-lite');
const parser = require('epg-parser');
const { ungzip } = require('pako');
const fs = require('fs');
const dayjs = require('dayjs');
const xmlbuilder = require('xmlbuilder');

// -------------------- Configuration --------------------
const SOURCES = {
  us: {
    url: 'https://epg.jesmann.com/iptv/UnitedStates.xml.gz',
    days: 7,
    whitelist: [
      "Comet","Laff","ABC","FOX","NBC","NewEnglandCableNews","PBS","CW","CBS","WSBK","ION",
      "MeTVNetwork","INSPHD","GameShowNetwork","FamilyEntertainmentTelevision","Heroes&IconsNetwork",
      "TurnerClassicMoviesHD","OprahWinfreyNetwork","BET","DiscoveryChannel","Freeform","USANetwork",
      "NewEnglandSportsNetwork","NewEnglandSportsNetworkPlus","NBCSportsBoston","ESPN","ESPN2",
      "ESPNEWS","AWealthofEntertainmentHD","WEtv","OxygenTrueCrime","DisneyChannel","DisneyJunior",
      "DisneyXD","CartoonNetwork","Nickelodeon","MSNBC","CableNewsNetwork","HLN","CNBC",
      "FoxNewsChannel","LifetimeRealWomen","TNT","Lifetime","LMN","TLC","AMC","Home&GardenTelevisionHD",
      "TheTravelChannel","A&E","FoodNetwork","Bravo","truTV","NationalGeographicHD","HallmarkChannel",
      "HallmarkFamily","HallmarkMystery","SYFY","AnimalPlanet","History","TheWeatherChannel",
      "ParamountNetwork","ComedyCentral","FXM","FXX","FX","E!EntertainmentTelevisionHD","AXSTV",
      "TVLand","TBS","VH1","MTV-MusicTelevision","CMT","DestinationAmerica","MagnoliaNetwork",
      "MagnoliaNetworkHD","DiscoveryLifeChannel","NationalGeographicWild","SmithsonianChannelHD",
      "BBCAmerica","POP","Crime&InvestigationNetworkHD","Vice","InvestigationDiscoveryHD",
      "ReelzChannel","DiscoveryFamilyChannel","Science","AmericanHeroesChannel","AMC+","Fuse",
      "MusicTelevisionHD","IFC","FYI","CookingChannel","Logo","AdultSwim","ANTENNA","CHARGE!",
      "FS1","FS2","NFLNetwork","NHLNetwork","MLBNetwork","NBATV","CBSSportsNetwork","Ovation","UPTV",
      "COZITV","OutdoorChannel","ASPiRE","HBO","HBO2","HBOComedy","HBOSignature","HBOWest","HBOZone",
      "CinemaxHD","MoreMAX","ActionMAX","5StarMAX","Paramount+withShowtimeOnDemand","ShowtimeExtreme",
      "ShowtimeNext","ShowtimeShowcase","ShowtimeFamilyzone","ShowtimeWomen","Starz","StarzEdge",
      "StarzCinema","StarzComedy","StarzEncore","StarzEncoreBlack","StarzEncoreClassic","StarzEncoreFamily",
      "StarzEncoreWesterns","StarzKids","StarzEncoreAction","ScreenPix","ScreenPixAction","ScreenPixVoices",
      "ScreenPixWesterns","MoviePlex","MGM+Drive-In","MGM+HD","MGM+Hits","SonyMovieChannel","TheMovieChannel"
    ]
  },
  usfast: {
    url: 'https://epg.jesmann.com/iptv/USFast.xml.gz',
    days: 3,
    whitelist: [
      "24/7 ACTION","24/7 ANIMATED SERIES","24/7 ANIME ACTION","24/7 ANIME CLASSICS","24/7 ANIME MOVIES",
      "24/7 BLACK CINEMA","24/7 CARTOON CLASSICS","24/7 COMEDY SHOWS","24/7 CRIME TV","24/7 FAMILY",
      "24/7 HORROR SHOWS","24/7 LOVE & ROMANCE","24/7 SCI-FI CLASSICS","24/7 TEEN DRAMAS","48 HOURS",
      "4UV","60 MINUTES","ACCORDING TO JIM","ACORN TV MYSTERIES","ADULT ANIMATION","AERIAL AMERICA",
      "ALASKA STATE TROOPERS","ALF","ALFRED HITCHCOCK PRESENTS","ALIEN NATION BY DUST","ALL REALITY WE TV",
      "ALL WEDDINGS WE TV","ALL-OUT ALASKA","AMERICA'S BOOK OF SECRETS","AMERICA'S COURT",
      "AMERICA'S DUMBEST CRIMINALS","AMERICAN CRIMES","AMERICAN GLADIATORS","AMERICAN JUSTICE",
      "AMERICAN NINJA WARRIOR","AMERICAN RESTORATION","ANGER MANAGEMENT","ANTIQUES ROAD TRIP",
      "ANTIQUES ROADSHOW UK","ANCIENT ALIENS","ANCIENT DISCOVERIES","ANCIENT SECRETS","APPALACHIAN OUTLAWS",
      "ART OF CRIME","AX MEN","BACKROAD TRUCKERS","BACKSTAGE","BAD GIRLS CLUB","BAR RESCUE","BAYWATCH",
      "BEYOND BELIEF","BID WARS","BIZARRE FOODS WITH ANDREW ZIMMERN","BLACK OPS","BRAVO VAULT","BRITBOX MYSTERIES",
      "BROADCAST HISTORY","BUZZR","BUYING ALASKA","BUYING THE BAYOU","CALIFORNIA DREAM EATS","CANADA'S WORST DRIVER",
      "CANADIAN PICKERS","CAR CHASE","CARTOON CLASSICS","CELEBRITY NAME GAME","CATCH A SMUGGLER","CHEATERS",
      "CHOPPERTOWNTV","CITY CONFIDENTIAL","CLASSIC DOCTOR WHO","COLD CASE FILES","COMBAT WAR CHANNEL",
      "COMEDY DYNAMICS","CONFESS BY NOSEY","CONTEST & GAME SHOWS","COOKING WITH FIRE","CORNER GAS","COUNTING CARS",
      "COURT CAM","COURT TV","COURT TV LEGENDARY TRIALS","CRIME & JUSTICE","CRIME SCENES","CRIME STORIES",
      "CRIME THRILLER","CRIMINAL COURT","CRUNCHYROLL","CSI","CURIOSITY STREAM","DALLAS SWAT","DANCE MOMS",
      "DATELINE 24/7","DEAL OR NO DEAL","DEAL ZONE","DEATH VALLEY DAYS","DEGRASSI","DESIGNATED SURVIVOR",
      "DESTINATION FEAR","DINOS 24/7","DIVORCE COURT","DOCUMENTARY+","DOG THE BOUNTY HUNTER",
      "DOG WHISPERER WITH CESAR MILLAN","DOVE TV","DR G MEDICAL EXAMINER","DR. PHIL","DR. PHIL PRIMETIME ON MOJ",
      "DUCK DYNASTY","E! KEEPING UP","EL REY REBEL","ELECTRIC NOW","ELLEN DEGENERES","EAT THE WORLD",
      "ENGINEERING CATASTROPHES","EXTREME JOBS BY LIONSGATE","EXTREME LOGGERS","FAMILY FEUD","FAMILY FEUD CLASSIC",
      "FAMILY UNSCRIPTED","FARSCAPE","FEAR FACTOR USA","FILMRISE ACTION","FILMRISE BRITISH TV","FILMRISE CLASSIC TV WESTERNS",
      "FILMRISE CLASSIC TV WESTERNS ENCOREMERIT STREET","FILMRISE FREE MOVIES","FGTEEV","FBI FILES","FORBIDDEN HISTORY",
      "FORENSIC FILES","GANGSTERS: AMERICA'S MOST...","GENERAL HOSPITAL","GHOST HUNTERS","GET","GET COMEDY",
      "GOLD RUSH","GRAND DESIGNS","GREEN ACRES","GROWING UP HIP HOP WE","HAUNTED HISTORY","HARLEM",
      "HISTORY & UNDISCOVERED","HISTORY COLD CASE","HISTORY HIT CHANNEL","HISTORY OF THE WORLD","HISTORY UNTOLD",
      "HIGHWAY THRU HELL","HUNTER X HUNTER","ICE COLD GOLD","ICE ROAD TRUCKERS","IMPACT WRESTLING","INSIDE AMERICAN MAFIA",
      "ISN'T IT ROMANTIC","IT TAKES A KILLER","JUDGE & JURY","JUDY JUSTICE","KIDS & FAMILY FUN","KINGS OF PAIN",
      "LAW & CRIME","LEVERAGE","LIFE BELOW ZERO","LIFE AND LEGEND OF WYATT EARP","LIFE OF CRIME","LOCKED UP ABROAD",
      "LOST WORLDS","LOVE AFTER LOCKUP WE","LOVE KILLS","MAGELLANTV WILDEST","MARVELLOUS MRS. M...","MEATEATER",
      "MEGA DISASTERS","MEMORY LANE","MIDSOMER MURDERS","MILITARY HEROES","MODERN INNOVATIONS B...","MODERN MARVELS",
      "MONSTERS ARE REAL","MOOVIMEX","MY FIRST PLACE","MURDER, SHE WROTE","MYSTERIES AT THE MUSEUM","MYSTERIES OF THE ABANDONED",
      "MYSTERIOUS WORLDS","MYSTERY SCIENCE THEATRE","MYTHBUSTERS","NARUTO","NASH BRIDGES","NASHVILLE","NASA+",
      "NATIONAL LAMPOON","NATIONAL PARK MYSTERIES","NATURESCAPE","NIKITA","NIP/TUCK","NOSTALGIC HITS","NO RESERVATIONS",
      "NOSEY","NYRD BLUE","ODDITIES","ON THE TELLY","ONLY IN AMERICA","OUTERSPHERE","OUTLAW","OVERTIME",
      "OXYGEN TRUE CRIME ARCHIVES","PAW PATROL","PAWS AND CLAWS","PARANORMAL FILES","PAWN STARS","PERFORM",
      "PIXEL","PLACES & SPACES","POKÉMON","PORTLANDIA","POWER RANGERS","PRIMETIME SOAPS","PROJECT BLUE BOOK",
      "PROJECT RUNWAY","PUREFLIX TV","REAL CRIME","REAL DETECTIVE","REAL DISASTER CHANNEL","REAL HOUSEWIVES VAULT",
      "REELZ FAMOUS AND INFAMOUS","REUTERS 60","REVRY","RIFFTRAX","RIVER MONSTERS","ROAD WARS","ROVR PETS",
      "RUSTIC RETREATS","SAVED BY THE BELL","SAY YES TO THE DRESS","SCARES BY SHUDDER","SCIENCE IS AMAZING",
      "SCRIPPS NEWS","SECRETS OF THE BIBLE","SHERIFFS: EL DORADO CO.","SHOUT! MOVIES","SILENT WITNESS & NEW TRICKS",
      "SLIGHTLY OFF IFC","SNL VAULT","STAR TREK","STARGATE","STARTALK","STORIES BY AMC","STRANGE EVIDENCE",
      "STRANGE WORLD","SUPERMARKET SWEEP","SUPER FREAKS","SUPERNANNY","SURVIVE OR DIE","SURVIVOR","SWEET ESCAPES",
      "SWERVE COMBAT","TASTEMADE","TASTEMADE HOME","TASTEMADE TRAVEL","TEEN WOLF","THE ADDAMS FAMILY",
      "THE APPRENTICE","THE ASYLUM MOVIE CHANNEL","THE BIGGEST LOSER","THE BOB ROSS CHANNEL","THE CAROL BURNETT SHOW",
      "THE CHALLENGE","THE CONNERS","THE DEAD FILES","THE DICK VAN DYKE SHOW","THE DOCTORS","THE DOG WHISPERER WIT...",
      "THE FBI","THE FIRST 48 BY A&E","THE GIRLS NEXT DOOR","THE INCREDIBLE DR. POL","THE JACK HANNA CHANN...","THE MALLORCA FILES",
      "THE MARTHA STEWART CHANNEL","THE NEW DETECTIVES","THE OSBOURNES","THE OUTER LIMITS","THE OUTPOST","THE PRACTICE",
      "THE PRICE IS RIGHT: DREW","THE PRICE IS RIGHT: THE BARKER YEARS","THE REAL MCCOYS","THE REPAIR SHOP","THE RIFLEMAN",
      "THE SAILOR MOON CHANNEL","THE THREE STOOGES +","THE WALKING DEAD CHA...","THE WALKING DEAD UNIVERSE","THE YOUNG RIDERS",
      "THIS OLD HOUSE","THIS OLD HOUSE MAKERS...","TMNT","TO CATCH A SMUGGLER","TOP CHEF VAULT","TOP GEAR","TRAILER PARK BOYS",
      "TRAVEL AND ADVENTURE","TRIBUNAL JUSTICE","TRUE CRIME & SCANDALS","TRUE CRIME NOW","TRUE HISTORY","TU DISCOVERY",
      "TV CLASSICS","TYLER PERRY’S LOVE THY...","ULTRAMAN","UNEXPLAINED ZONE","UNIQUE LIVES","UNSOLVED MYSTERIES",
      "VICE","VICE NEWS","WANTED: DEAD OR ALIVE","WAYPOINT TV","WEEDS AND NURSE JACKIE","WELCOME HOME","WICKED TUNA",
      "WIPEOUT","WONDERS OF THE WOR...","WONDERY EXHIBIT C TRU...","WWE CHANNEL","WORLD’S WILDEST POLICE VIDEOS",
      "XPLORATION STATION","YOUNG ICONS","Z LIVING","ZUMBO’S JUST DESSERTS","AT THE MOVIES","CINEVAULT",
      "CINEVAULT CLASSICS","EPIX","EPIX 2","EPIX DRIVE IN","EPIX HITS","FILMRISE ACTION","FILMRISE FREE MOVIES",
      "MGM ACTION","MGM HORROR","MGM PRESENTS","MOVIESPHERE","MIRAMAX MOVIE CHANNEL","SCREAMBOXTV","SCREENPIX",
      "SCREENPIX ACTION","SCREENPIX VOICES","UNIVERSAL MOVIES","UNIVERSAL MONSTERS"
    ]
  }
};

// -------------------- Cache --------------------
let cachedContent = {};

// -------------------- Helper Functions --------------------
async function fetchAndParse(provider) {
  const src = SOURCES[provider];
  const buffer = await axios
    .get(src.url, { responseType: 'arraybuffer' })
    .then(r => r.data);

  const content = ungzip(buffer);
  const encoded = iconv.decode(content, 'utf8');
  cachedContent[provider] = parser.parse(encoded);
  return cachedContent[provider];
}

function filterChannels(channels, whitelist) {
  return channels.filter(ch =>
    whitelist.some(name => ch.displayName[0].value.toLowerCase().includes(name.toLowerCase()))
  );
}

function filterPrograms(programs, channelsWhitelist, provider) {
  const allowedIds = cachedContent[provider].channels
    .filter(ch => channelsWhitelist.some(name => ch.displayName[0].value.toLowerCase().includes(name.toLowerCase())))
    .map(ch => ch.id);

  return programs.filter(p => allowedIds.includes(p.channel));
}

// -------------------- XMLTV Generation --------------------
function generateXMLTV(provider) {
  const { channels, programs } = cachedContent[provider];
  const whitelist = SOURCES[provider].whitelist;

  const xml = xmlbuilder.create('tv', { encoding: 'UTF-8' });

  // Channels
  filterChannels(channels, whitelist).forEach(ch => {
    const chNode = xml.ele('channel', { id: `${provider}#${ch.id}` });
    chNode.ele('display-name', {}, ch.displayName[0].value);
    if (ch.icon?.[0]?.src) chNode.ele('icon', { src: ch.icon[0].src });
  });

  // Programs
  filterPrograms(programs, whitelist, provider).forEach(p => {
    const start = dayjs(p.start);
    const stop  = dayjs(p.stop);
    const now = dayjs();
    const maxDate = now.add(SOURCES[provider].days, 'day');
    if (start.isAfter(maxDate)) return;

    const progNode = xml.ele('programme', {
      start: start.format('YYYYMMDDHHmmss Z'),
      stop: stop.format('YYYYMMDDHHmmss Z'),
      channel: `${provider}#${p.channel}`
    });
    if (p.title?.[0]?.value) progNode.ele('title', {}, p.title[0].value);
    if (p.desc?.[0]?.value) progNode.ele('desc', {}, p.desc[0].value);
  });

  return xml.end({ pretty: true });
}

// -------------------- Main Function --------------------
async function main() {
  for (const provider of Object.keys(SOURCES)) {
    console.log(`Fetching EPG for ${provider}...`);
    await fetchAndParse(provider);

    const xmltv = generateXMLTV(provider);
    fs.writeFileSync(`${provider}.xml`, xmltv, 'utf8');
    console.log(`Generated XMLTV for ${provider} with ${SOURCES[provider].days} days.`);
  }
}

// Run
main().catch(console.error);
