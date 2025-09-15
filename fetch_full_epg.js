#!/usr/bin/env node
'use strict';

const https = require('https');
const fs = require('fs');
const zlib = require('zlib');
const sax = require('sax');
const { pipeline } = require('stream');

// Whitelisted channels for 3-day EPG
const channels3Day = [
  "4UV.us",
  "48Hours(48HOURS).us",
  "60Minutes(60MINS).us",
  "AccordingtoJim(DISATJ).us",
  "AcornTVMysteries(ACNMYST).us",
  "AdultAnimation(PPLUSAA).us",
  "ALF.us",
  "AlfredHitchcockPresents(AHP).us",
  "AlienNationbyDUST(DUST).us",
  "AllRealityWEtv(WEREAL).us",
  "AllWeddingsWEtv(ALLWED).us",
  "America'sDumbestCriminals(XMVADC).us",
  "AmericanCrimes(ACRM).us",
  "AmericanNinjaWarrior(AMNJWR).us",
  "AncientAliens(ANCIENT).us",
  "AngerManagement(AGRMGT).us",
  "AntiquesRoadshowUK(ARUK).us",
  "AttheMovies(WBTV1S).us",
  "AxMen(AXMEN).us",
  "Backstage(BAKSGE).us",
  "BadGirlsClub(BGCL).us",
  "BarRescue(PTVBAR).us",
  "Baywatch(BAYW).us",
  "BestofDr.Phil(BDPH).us",
  "BeyondBelief(XMVBB).us",
  "BeyondBelief:FactorFiction!(XAZBBUK).us",
  "BravoVault(BRVVLT).us",
  "BritBoxMysteries(PTVBBMS).us",
  "BritBoxMysteries(BBCBBM).us",
  "BUZZRStream(BUZZRST).us",
  "CarChase(CARCHSE).us",
  "CelebrityNameGame(CNGWCF).us",
  "Cheaters(XMVCH).us",
  "CINEVAULT(CINEVLT).us",
  "CINEVAULTWesterns(CVWEST).us",
  "CINEVAULT:Classics(CVCLASS).us",
  "CINEVAULT:Westerns(VIZWEST).us",
  "ClassicDoctorWho(CDW).us",
  "ClassicDoctorWho(CDWTUBI).us",
  "ColdCaseFiles(PTVCCF).us",
  "ColdCaseFiles(COLD).us",
  "CombatWarChannel(XPLCWC).us",
  "ComedyDynamics(COMCLN).us",
  "ConfessbyNosey(NSYCONF).us",
  "CornerGas(WAZCGAS).us",
  "CourtTV(COURTST).us",
  "CourtTVLegendaryTrials(LEGTRI).us",
  "Crime&Justice(PPLUSCJ).us",
  "CrimeScenes(WBTV5S).us",
  "Crunchyroll(CRUNCHY).us",
  "CSI(PTVCSI).us",
  "CSI(PPLUSCSI).us",
  "DanceMoms(DANCM).us",
  "DealorNoDeal(DORNOD).us",
  "DealZone(DEALZON).us",
  "DeathValleyDays(XMVDTH).us",
  "Degrassi(PTVDEG).us",
  "Degrassi(DGRASSI).us",
  "Dinos24/7(BBCDINO).us",
  "DivorceCourt(XMVDC).us",
  "DivorceCourt(XALDIV).us",
  "DNUTastemadeEnEspañol(TMESP8).us",
  "Documentary+(DOCPLUS).us",
  "DogtheBountyHunter(PTVDTBH).us",
  "DogtheBountyHunter(DOTBH).us",
  "DuckDynasty(DUCKDYN).us",
  "E!KeepingUp(EKEEPUP).us",
  "ElReyRebel(ELREYST).us",
  "FamilyFeud(XALFAMF).us",
  "FamilyFeud(XMVFMF).us",
  "FamilyFeudClassic(FFCL).us",
  "FamilyUnscripted(WBTV8).us",
  "Farscape(FSCAPE).us",
  "FBIFiles(PTVUKFB).us",
  "FearFactorUSA(FFUSA).us",
  "FGTeeV(FGTEEV).us",
  "FilmRiseAction(XALFACT).us",
  "FilmRiseAction(XMVFRA).us",
  "FilmRiseAction(XSLFA).us",
  "FilmRiseBritishTV(XPLFRBT).us",
  "FilmRiseBritishTV(XMVFBR).us",
  "FilmRiseClassicTV(XALFRCL).us",
  "FilmRiseFreeMovies(XMVFFM).us",
  "FilmRiseFreeMovies(XALFRFM).us",
  "FilmRiseFreeMovies(XPLCAFM).us",
  "FilmRiseFreeMovies(XPLFMUK).us",
  "FilmRiseTrueCrime(XALFRCR).us",
  "FNENashville(FNENASH).us",
  "Food52(XALFFT).us",
  "ForensicFiles(XMVFF).us",
  "ForensicFiles(VIZFORF).us",
  "ForensicFiles(XPLFF).us",
  "ForensicFiles(XCCFF).us",
  "GeneralHospital(DISGN).us",
  "get(GETTVS).us",
  "GETComedy(GETCMDY).us",
  "GrandDesigns(WAZGD).us",
  "GreenAcres(GREENAC).us",
  "GrowingUpHipHopWEtv(GUHHWE).us",
  "Harlem(NGBRUSB).us",
  "History&Undiscovered(PPLUSHISUN).us",
  "HunterxHunter(HUNHUN).us",
  "IceRoadTruckers(VIZICERT).us",
  "IceRoadTruckers(ICEROAD).us",
  "ImpactWrestling(PTVIMPT).us",
  "Isn'tItRomantic(AMZADH).us",
  "Judge&Jury(PRMVDO).us",
  "JudgeNosey(JDNOSEY).us",
  "JudyJustice(JUDYJUS).us",
  "JudyJustice(JUDYJUK).us",
  "Kids&FamilyFun(PPLUSKIDFF).us",
  "Law&CrimeRewind(LCRSTR).us",
  "Law&CrimeStream(LCSTR).us",
  "Leverage(WAZFVO).us",
  "LoveAfterLockupWeTV(LALU).us",
  "MagellanTVWildest(MAGUTC1).us",
  "MeatEater(MEATEAT).us",
  "MGMPresents(MGMPRES).us",
  "MGMPresents:Action(MGMACT).us",
  "MGMPresents:Horror(MPSCIFI).us",
  "MGMPresents:Westerns(MPWEST).us",
  "MidsomerMurders(MIDSMUR).us",
  "MilitaryHeroes(MILITRY).us",
  "MiramaxMovieChannel(MMC).us",
  "ModernMarvels(MODMARV).us",
  "Moovimex(MOOVM).us",
  "Moviesphere(MOVSPH).us",
  "Moviesphere(MVSPUK).us",
  "MysteriousWorlds(WBTV4).us",
  "Naruto(NRUTO).us",
  "NASA+(NASAPLS).us",
  "NashBridges(NSHBRG).us",
  "Nashville(NASH).us",
  "NationalLampoon(NLC).us",
  "NBC(KGETDT).us",
  "NBCNashville(WSMV4)(NBCWSMV).us",
  "News13CentralFL-STVA(SN13CFL).us",
  "Nikita(WBTVNIK).us",
  "Nosey(PTVNOSE).us",
  "Nosey(NOSEY).us",
  "NoseyonPeacock(NOSEYP).us",
  "NostalgicHits(PPLUSNOS).us",
  "OnTheTelly(WBTVOTT).us",
  "OuterSphere(OTRSPH).us",
  "Outlaw(OUTLW).us",
  "Overtime(OTFAST).us",
  "OxygenTrueCrimeArchives(OXYTCA).us",
  "ParanormalFiles(XMVPF).us",
  "ParanormalFiles(VIZPARA).us",
  "ParanormalFiles(XPLPF).us",
  "PAWPatrol(PPLUSPAW).us",
  "Perform(PERFORM).us",
  "Places&Spaces(PLASP).us",
  "PlutoAntiquesRoadshowUK(PTVARUK).us",
  "PlutoBaywatch(PTVBAY).us",
  "PlutoForensicFiles(PTVFORF).us",
  "PlutoLeverage(PTVLVRG).us",
  "PlutoStoriesbyAMC(PTVSAMC).us",
  "PlutoThisOldHouse(PTVTOH).us",
  "PlutoTVCSIMiami(PTVCSIM).us",
  "PlutoTVCSINY(PTVCSINY).us",
  "Portlandia(PRTLNDA).us",
  "PowerRangers(PR).us",
  "ProjectRunway(WAZPRUN).us",
  "PureFlixTV(PFTV).us",
  "RealCrime(RCRIM).us",
  "RealCrime(RCRIMUS).us",
  "RealCrimeUncoveredbyVideoElephant(RCU).us",
  "RealDisasterChannel(CRD).us",
  "RealHousewivesVault(RHLVT).us",
  "ReelzFamousandInfamous(REELZSTR).us",
  "Reuters60(REUTERS).us",
  "Revry(REVRY).us",
  "Revry2(REVRY2).us",
  "RevryGlobal(RVRYINT).us",
  "RovrPets(ROVRPET).us",
  "SavedbytheBell(SVDBELL).us",
  "ScaresbyShudder(SBSHUDD).us",
  "ScreamboxTV(SBOXTV).us",
  "ScreenPix(SCRNPIX).us",
  "ScreenPixAction(SCRNACT).us",
  "ScreenPixVoices(SCRNVOI).us",
  "ScreenPixWesternsHD(SCWSTHD).us",
  "ScrippsNews(SCNEWST).us",
  "Shout!Movies(SMOVIES).us",
  "SilentWitness&NewTricks(BBCSWNT).us",
  "SlightlyOffIFC(IFCOFF).us",
  "SNLVault(PK3).us",
  "StarTrek(PTVSTAR).us",
  "StarTrek(PPLUSST).us",
  "STARGATE(STARGAT).us",
  "StingrayNaturescape(NESCAPP).us",
  "StingrayNaturescape(NESCAP).us",
  "StingrayNaturescapeStream(A003PST).us",
  "StoriesbyAMC(AMCPRES).us",
  "StoriesbyAMC(AMCDRM).us",
  "SupermarketSweep(SPRSWP).us",
  "Supernanny(DISSN).us",
  "Survivor(PTVSURV).us",
  "Survivor(PPLUSSUR).us",
  "SweetEscapes(WBTV9S).us",
  "SwerveCombat(SCOMBAT).us",
  "Tastemade(TASTE).us",
  "Tastemade(TMFRE16).us",
  "TastemadeFree(TMFREE).us",
  "TastemadeHome(TMHOME).us",
  "TastemadeInternational(TMINTL).us",
  "TastemadeTravel(VIZTASTR).us",
  "TastemadeEspañolUS(TMESP).us",
  "TastemadeTravel(TMTRAVEL).us",
  "TeenWolf(TEENWLF).us",
  "TeenageMutantNinjaTurtles(TMNTFV).us",
  "TheAddamsFamily(ADDAMS).us",
  "TheApprentice(APPRNTC).us",
  "TheBiggestLoser(BIGLOSE).us",
  "TheBobRossChannel(TBRCSTR).us",
  "TheCarolBurnettShow(CAROL).us",
  "TheChallenge(PTVCHALL).us",
  "TheChallenge(PPLUSCHAL).us",
  "TheDickVanDykeShow(XAZDICK).us",
  "TheDickVanDykeShow(XSLDVD).us",
  "TheDoctors(DOCTORS).us",
  "TheFBIFiles(XMVFBI).us",
  "TheFBIFiles(XSLFBI).us",
  "TheFBIFiles(XPLFBI).us",
  "TheFirst48byA&E(FIRST48).us",
  "TheGirlsNextDoor(XAZGND).us",
  "TheLifeandLegendofWyattEarp(XAZLWE).us",
  "TheMallorcaFiles(MLLFLS).us",
  "TheMarthaStewartChannel(TOHMST).us",
  "TheMarthaStewartChannel(MSFREEV).us",
  "TheNewDetectives(XMVND).us",
  "TheOuterLimits(OUTLIM).us",
  "TheOutpost(XMVOUT).us",
  "ThePractice(PRACT).us",
  "TheRealMcCoys(XAZTRM).us",
  "TheRiffTraxChannel(RIFF).us",
  "TheRifleman(XAZTRF).us",
  "TheRifleman(XTBRFL).us",
  "TheRifleman(XSLRIF).us",
  "TheThreeStooges+(XAZTTS).us",
  "TheWalkingDeadUniverse(TWDU).us",
  "TheYoungRiders(YNGRDRS).us",
  "ThisOldHouse(TOHOUSE).us",
  "ThisOldHouse(THISOH).us",
  "ThisOldHouse(TOHAMZ).us",
  "ThisOldHouseMakersChannel(TOHMC).us",
  "TopChefVault(LVEGAS).us",
  "TopGear(TOPGEAR).us",
  "TopGear(TPGR).us",
  "TOTALLYTURTLES(TOTTMNT).us",
  "TrailerParkBoys:TheSwearNetShow(TPB).us",
  "TribunalJustice(AMZTRJ).us",
  "TrueCrimeNow(TRUCRIN).us",
  "TrueCrimeNow(TCNEST1).us",
  "TrueHistory(TH).us",
  "TVClassics(PPLUSTVC).us",
  "UniqueLives(WBTV6).us",
  "UniversalMonsters(UNIMON).us",
  "UniversalMovies(UNIMOV).us",
  "UnsolvedMysteries(XAZUNS).us",
  "UnsolvedMysteries(XAZUMUK).us",
  "UnsolvedMysteries(XTBUSL).us",
  "UnsolvedMysteries(XSLUM).us",
  "UnsolvedMysteries(XPLUSM).us",
  "Vice(VICEF1).us",
  "ViceNews(VICEF2).us",
  "ViceStream(VICESTR).us",
  "Wanted:DeadorAlive(WDOA).us",
  "WaypointTV(WYPOINT).us",
  "WeatherNationNashville(WNANASH).us",
  "WelcomeHome[Sling](WBTV11S).us",
  "WickedTuna(DISTW).us",
  "Wipeout(DISWO).us",
  "WipeoutXtra(WIPEOUT).us"
];

// EPG URL
const EPG_URL = 'https://epg.jesmann.com/iptv/USFast.xml.gz';

// Output file
const OUTPUT_FILE = 'epg_3day_filtered.xml';

// Create sax stream
const saxStream = sax.createStream(true, { trim: true });
const outputStream = fs.createWriteStream(OUTPUT_FILE);
let insideChannel = false;
let insideProgram = false;

saxStream.on('opentag', node => {
  if (node.name === 'channel' && channels3Day.includes(node.attributes.id)) {
    insideChannel = true;
    outputStream.write(`<channel id="${node.attributes.id}">`);
  } else if (node.name === 'programme' && channels3Day.includes(node.attributes.channel)) {
    insideProgram = true;
    let attrs = Object.entries(node.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    outputStream.write(`<programme ${attrs}>`);
  }
});

saxStream.on('text', text => {
  if (insideChannel || insideProgram) outputStream.write(text);
});

saxStream.on('closetag', name => {
  if (name === 'channel' && insideChannel) {
    outputStream.write(`</channel>`);
    insideChannel = false;
  } else if (name === 'programme' && insideProgram) {
    outputStream.write(`</programme>`);
    insideProgram = false;
  }
});

saxStream.on('error', err => {
  console.error('SAX parse error:', err);
  process.exit(1);
});

saxStream.on('end', () => {
  console.log('3-day filtered EPG saved as', OUTPUT_FILE);
});

// Stream the gzipped file from URL
https.get(EPG_URL, res => {
  const gunzip = zlib.createGunzip();
  pipeline(res, gunzip, saxStream, err => {
    if (err) {
      console.error('Pipeline failed:', err);
      process.exit(1);
    }
  });
});
