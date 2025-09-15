// fetch_full_epg.js
const fs = require('fs-extra');
const axios = require('axios');
const zlib = require('zlib');
const xml2js = require('xml2js');

const channels3Day = [
  { full: "4UV.us", clean: "4UV" },
  { full: "48Hours(48HOURS).us", clean: "48Hours" },
  { full: "60Minutes(60MINS).us", clean: "60Minutes" },
  { full: "AccordingtoJim(DISATJ).us", clean: "AccordingtoJim" },
  { full: "AcornTVMysteries(ACNMYST).us", clean: "AcornTVMysteries" },
  { full: "AdultAnimation(PPLUSAA).us", clean: "AdultAnimation" },
  { full: "ALF.us", clean: "ALF" },
  { full: "AlfredHitchcockPresents(AHP).us", clean: "AlfredHitchcockPresents" },
  { full: "AlienNationbyDUST(DUST).us", clean: "AlienNationbyDUST" },
  { full: "AllRealityWEtv(WEREAL).us", clean: "AllRealityWEtv" },
  { full: "AllWeddingsWEtv(ALLWED).us", clean: "AllWeddingsWEtv" },
  { full: "America'sDumbestCriminals(XMVADC).us", clean: "America'sDumbestCriminals" },
  { full: "AmericanCrimes(ACRM).us", clean: "AmericanCrimes" },
  { full: "AmericanNinjaWarrior(AMNJWR).us", clean: "AmericanNinjaWarrior" },
  { full: "AncientAliens(ANCIENT).us", clean: "AncientAliens" },
  { full: "AngerManagement(AGRMGT).us", clean: "AngerManagement" },
  { full: "AntiquesRoadshowUK(ARUK).us", clean: "AntiquesRoadshowUK" },
  { full: "AttheMovies(WBTV1S).us", clean: "AttheMovies" },
  { full: "AxMen(AXMEN).us", clean: "AxMen" },
  { full: "Backstage(BAKSGE).us", clean: "Backstage" },
  { full: "BadGirlsClub(BGCL).us", clean: "BadGirlsClub" },
  { full: "BarRescue(PTVBAR).us", clean: "BarRescue" },
  { full: "Baywatch(BAYW).us", clean: "Baywatch" },
  { full: "BestofDr.Phil(BDPH).us", clean: "BestofDr.Phil" },
  { full: "BeyondBelief(XMVBB).us", clean: "BeyondBelief" },
  { full: "BeyondBelief:FactorFiction!(XAZBBUK).us", clean: "BeyondBelief:FactorFiction!" },
  { full: "BravoVault(BRVVLT).us", clean: "BravoVault" },
  { full: "BritBoxMysteries(PTVBBMS).us", clean: "BritBoxMysteries" },
  { full: "BritBoxMysteries(BBCBBM).us", clean: "BritBoxMysteries" },
  { full: "BUZZRStream(BUZZRST).us", clean: "BUZZRStream" },
  { full: "CarChase(CARCHSE).us", clean: "CarChase" },
  { full: "CelebrityNameGame(CNGWCF).us", clean: "CelebrityNameGame" },
  { full: "Cheaters(XMVCH).us", clean: "Cheaters" },
  { full: "CINEVAULT(CINEVLT).us", clean: "CINEVAULT" },
  { full: "CINEVAULTWesterns(CVWEST).us", clean: "CINEVAULTWesterns" },
  { full: "CINEVAULT:Classics(CVCLASS).us", clean: "CINEVAULT:Classics" },
  { full: "CINEVAULT:Westerns(VIZWEST).us", clean: "CINEVAULT:Westerns" },
  { full: "ClassicDoctorWho(CDW).us", clean: "ClassicDoctorWho" },
  { full: "ClassicDoctorWho(CDWTUBI).us", clean: "ClassicDoctorWho" },
  { full: "ColdCaseFiles(PTVCCF).us", clean: "ColdCaseFiles" },
  { full: "ColdCaseFiles(COLD).us", clean: "ColdCaseFiles" },
  { full: "CombatWarChannel(XPLCWC).us", clean: "CombatWarChannel" },
  { full: "ComedyDynamics(COMCLN).us", clean: "ComedyDynamics" },
  { full: "ConfessbyNosey(NSYCONF).us", clean: "ConfessbyNosey" },
  { full: "CornerGas(WAZCGAS).us", clean: "CornerGas" },
  { full: "CourtTV(COURTST).us", clean: "CourtTV" },
  { full: "CourtTVLegendaryTrials(LEGTRI).us", clean: "CourtTVLegendaryTrials" },
  { full: "Crime&Justice(PPLUSCJ).us", clean: "Crime&Justice" },
  { full: "CrimeScenes(WBTV5S).us", clean: "CrimeScenes" },
  { full: "Crunchyroll(CRUNCHY).us", clean: "Crunchyroll" },
  { full: "CSI(PTVCSI).us", clean: "CSI" },
  { full: "CSI(PPLUSCSI).us", clean: "CSI" },
  { full: "DanceMoms(DANCM).us", clean: "DanceMoms" },
  { full: "DealorNoDeal(DORNOD).us", clean: "DealorNoDeal" },
  { full: "DealZone(DEALZON).us", clean: "DealZone" },
  { full: "DeathValleyDays(XMVDTH).us", clean: "DeathValleyDays" },
  { full: "Degrassi(PTVDEG).us", clean: "Degrassi" },
  { full: "Degrassi(DGRASSI).us", clean: "Degrassi" },
  { full: "Dinos24/7(BBCDINO).us", clean: "Dinos24/7" },
  { full: "DivorceCourt(XMVDC).us", clean: "DivorceCourt" },
  { full: "DivorceCourt(XALDIV).us", clean: "DivorceCourt" },
  { full: "DNUTastemadeEnEspañol(TMESP8).us", clean: "DNUTastemadeEnEspañol" },
  { full: "Documentary+(DOCPLUS).us", clean: "Documentary+" },
  { full: "DogtheBountyHunter(PTVDTBH).us", clean: "DogtheBountyHunter" },
  { full: "DogtheBountyHunter(DOTBH).us", clean: "DogtheBountyHunter" },
  { full: "DuckDynasty(DUCKDYN).us", clean: "DuckDynasty" },
  { full: "E!KeepingUp(EKEEPUP).us", clean: "E!KeepingUp" },
  { full: "ElReyRebel(ELREYST).us", clean: "ElReyRebel" },
  { full: "FamilyFeud(XALFAMF).us", clean: "FamilyFeud" },
  { full: "FamilyFeud(XMVFMF).us", clean: "FamilyFeud" },
  { full: "FamilyFeudClassic(FFCL).us", clean: "FamilyFeudClassic" },
  { full: "FamilyUnscripted(WBTV8).us", clean: "FamilyUnscripted" },
  { full: "Farscape(FSCAPE).us", clean: "Farscape" },
  { full: "FBIFiles(PTVUKFB).us", clean: "FBIFiles" },
  { full: "FearFactorUSA(FFUSA).us", clean: "FearFactorUSA" },
  { full: "FGTeeV(FGTEEV).us", clean: "FGTeeV" },
  { full: "FilmRiseAction(XALFACT).us", clean: "FilmRiseAction" },
  { full: "FilmRiseAction(XMVFRA).us", clean: "FilmRiseAction" },
  { full: "FilmRiseAction(XSLFA).us", clean: "FilmRiseAction" },
  { full: "FilmRiseBritishTV(XPLFRBT).us", clean: "FilmRiseBritishTV" },
  { full: "FilmRiseBritishTV(XMVFBR).us", clean: "FilmRiseBritishTV" },
  { full: "FilmRiseClassicTV(XALFRCL).us", clean: "FilmRiseClassicTV" },
  { full: "FilmRiseFreeMovies(XMVFFM).us", clean: "FilmRiseFreeMovies" },
  { full: "FilmRiseFreeMovies(XALFRFM).us", clean: "FilmRiseFreeMovies" },
  { full: "FilmRiseFreeMovies(XPLCAFM).us", clean: "FilmRiseFreeMovies" },
  { full: "FilmRiseFreeMovies(XPLFMUK).us", clean: "FilmRiseFreeMovies" },
  { full: "FilmRiseTrueCrime(XALFRCR).us", clean: "FilmRiseTrueCrime" },
  { full: "FNENashville(FNENASH).us", clean: "FNENashville" },
  { full: "Food52(XALFFT).us", clean: "Food52" },
  { full: "ForensicFiles(XMVFF).us", clean: "ForensicFiles" },
  { full: "ForensicFiles(VIZFORF).us", clean: "ForensicFiles" },
  { full: "ForensicFiles(XPLFF).us", clean: "ForensicFiles" },
  { full: "ForensicFiles(XCCFF).us", clean: "ForensicFiles" },
  { full: "GeneralHospital(DISGN).us", clean: "GeneralHospital" },
  { full: "get(GETTVS).us", clean: "get" },
  { full: "GETComedy(GETCMDY).us", clean: "GETComedy" },
  { full: "GrandDesigns(WAZGD).us", clean: "GrandDesigns" },
  { full: "GreenAcres(GREENAC).us", clean: "GreenAcres" },
  { full: "GrowingUpHipHopWEtv(GUHHWE).us", clean: "GrowingUpHipHopWEtv" },
  { full: "Harlem(NGBRUSB).us", clean: "Harlem" },
  { full: "History&Undiscovered(PPLUSHISUN).us", clean: "History&Undiscovered" },
  { full: "HunterxHunter(HUNHUN).us", clean: "HunterxHunter" },
  { full: "IceRoadTruckers(VIZICERT).us", clean: "IceRoadTruckers" },
  { full: "IceRoadTruckers(ICEROAD).us", clean: "IceRoadTruckers" },
  { full: "ImpactWrestling(PTVIMPT).us", clean: "ImpactWrestling" },
  { full: "Isn'tItRomantic(AMZADH).us", clean: "Isn'tItRomantic" },
  { full: "Judge&Jury(PRMVDO).us", clean: "Judge&Jury" },
  { full: "JudgeNosey(JDNOSEY).us", clean: "JudgeNosey" },
  { full: "JudyJustice(JUDYJUS).us", clean: "JudyJustice" },
  { full: "JudyJustice(JUDYJUK).us", clean: "JudyJustice" },
  { full: "Kids&FamilyFun(PPLUSKIDFF).us", clean: "Kids&FamilyFun" },
  { full: "Law&CrimeRewind(LCRSTR).us", clean: "Law&CrimeRewind" },
  { full: "Law&CrimeStream(LCSTR).us", clean: "Law&CrimeStream" },
  { full: "Leverage(WAZFVO).us", clean: "Leverage" },
  { full: "LoveAfterLockupWeTV(LALU).us", clean: "LoveAfterLockupWeTV" },
  { full: "MagellanTVWildest(MAGUTC1).us", clean: "MagellanTVWildest" },
  { full: "MeatEater(MEATEAT).us", clean: "MeatEater" },
  { full: "MGMPresents(MGMPRES).us", clean: "MGMPresents" },
  { full: "MGMPresents:Action(MGMACT).us", clean: "MGMPresents:Action" },
  { full: "MGMPresents:Horror(MPSCIFI).us", clean: "MGMPresents:Horror" },
  { full: "MGMPresents:Westerns(MPWEST).us", clean: "MGMPresents:Westerns" },
  { full: "MidsomerMurders(MIDSMUR).us", clean: "MidsomerMurders" },
  { full: "MilitaryHeroes(MILITRY).us", clean: "MilitaryHeroes" },
  { full: "MiramaxMovieChannel(MMC).us", clean: "MiramaxMovieChannel" },
  { full: "ModernMarvels(MODMARV).us", clean: "ModernMarvels" },
  { full: "Moovimex(MOOVM).us", clean: "Moovimex" },
  { full: "Moviesphere(MOVSPH).us", clean: "Moviesphere" },
  { full: "Moviesphere(MVSPUK).us", clean: "Moviesphere" },
  { full: "MysteriousWorlds(WBTV4).us", clean: "MysteriousWorlds" },
  { full: "Naruto(NRUTO).us", clean: "Naruto" },
  { full: "NASA+(NASAPLS).us", clean: "NASA+" },
  { full: "NashBridges(NSHBRG).us", clean: "NashBridges" },
  { full: "Nashville(NASH).us", clean: "Nashville" },
  { full: "NationalLampoon(NLC).us", clean: "NationalLampoon" },
  { full: "NBC(KGETDT).us", clean: "NBC" },
  { full: "NBCNashville(WSMV4)(NBCWSMV).us", clean: "NBCNashville" },
  { full: "News13CentralFL-STVA(SN13CFL).us", clean: "News13CentralFL-STVA" },
  { full: "Nikita(WBTVNIK).us", clean: "Nikita" },
  { full: "Nosey(PTVNOSE).us", clean: "Nosey" },
  { full: "Nosey(NOSEY).us", clean: "Nosey" },
  { full: "NoseyonPeacock(NOSEYP).us", clean: "NoseyonPeacock" },
  { full: "NostalgicHits(PPLUSNOS).us", clean: "NostalgicHits" },
  { full: "OnTheTelly(WBTVOTT).us", clean: "OnTheTelly" },
  { full: "OuterSphere(OTRSPH).us", clean: "OuterSphere" },
  { full: "Outlaw(OUTLW).us", clean: "Outlaw" },
  { full: "Overtime(OTFAST).us", clean: "Overtime" },
  { full: "OxygenTrueCrimeArchives(OXYTCA).us", clean: "OxygenTrueCrimeArchives" },
  { full: "ParanormalFiles(XMVPF).us", clean: "ParanormalFiles" },
  { full: "ParanormalFiles(VIZPARA).us", clean: "ParanormalFiles" },
  { full: "PawnStars(PSH).us", clean: "PawnStars" },
  { full: "PBS(HD01).us", clean: "PBS" },
  { full: "PeacockMovies(PKMOV).us", clean: "PeacockMovies" },
  { full: "PeacockTV(PKTV).us", clean: "PeacockTV" },
  { full: "PENNYWORTH(PNYWRTH).us", clean: "PENNYWORTH" },
  { full: "PeopleAreTalking(XMVPR).us", clean: "PeopleAreTalking" },
  { full: "PeopleTV(PTV).us", clean: "PeopleTV" },
  { full: "PickleTV(PKTV).us", clean: "PickleTV" },
  { full: "Reelz(REELZ).us", clean: "Reelz" },
  { full: "SciFiChannel(SCFI).us", clean: "SciFiChannel" },
  { full: "ShoutFactory(SHOUT).us", clean: "ShoutFactory" },
  { full: "Smithsonian(SMTH).us", clean: "Smithsonian" },
  { full: "SportsChannel(SPORTS).us", clean: "SportsChannel" },
  { full: "Starz(STRZ).us", clean: "Starz" },
  { full: "SyFy(SYFY).us", clean: "SyFy" },
  { full: "TBS(TBS).us", clean: "TBS" },
  { full: "TCM(TCM).us", clean: "TCM" },
  { full: "TLC(TLC).us", clean: "TLC" },
  { full: "TNT(TNT).us", clean: "TNT" },
  { full: "TravelChannel(TRVL).us", clean: "TravelChannel" },
  { full: "TVLand(TVLAND).us", clean: "TVLand" },
  { full: "USA(USA).us", clean: "USA" },
  { full: "VH1(VH1).us", clean: "VH1" },
  { full: "WipeoutXtra(WPXTRA).us", clean: "WipeoutXtra" }
];

async function fetch3DayEPG() {
  try {
    console.log('Fetching 3-day EPG...');

    const url = 'https://epg.jesmann.com/iptv/USFast.xml.gz';
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const xmlBuffer = zlib.gunzipSync(response.data);
    const xmlString = xmlBuffer.toString('utf-8');

    const parsed = await xml2js.parseStringPromise(xmlString);

    const filteredChannels = parsed.tv.channel.filter(ch => {
      const id = ch.$.id.toLowerCase();
      const displayNames = (ch['display-name'] || []).map(d => d.toLowerCase());
      return channels3Day.some(c =>
        id.includes(c.full.toLowerCase()) ||
        displayNames.some(d => d.includes(c.clean.toLowerCase()))
      );
    });

    const filteredPrograms = parsed.tv.programme.filter(pr =>
      filteredChannels.some(ch => ch.$.id === pr.$.channel)
    );

    const builder = new xml2js.Builder();
    const finalXml = builder.buildObject({
      tv: {
        $: parsed.tv.$,
        channel: filteredChannels,
        programme: filteredPrograms
      }
    });

    await fs.outputFile('epg_3day_filtered.xml', finalXml);
    console.log('3-day filtered EPG saved as epg_3day_filtered.xml');
  } catch (err) {
    console.error('Error fetching 3-day EPG:', err.message);
  }
}

fetch3DayEPG();
