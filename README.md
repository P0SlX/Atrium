# Atrium
Bot Discord fait sur-mesure pour un serveur privé basé sur le wrapper Discord.JS

## Configuration et installation
**Le bot à été testé uniquement sous Linux (Ubuntu 20.04 et Arch Linux Kernel 5.17)**

```
$ git clone git@github.com:P0SlX/Atrium.git
$ cd Atrium/
$ yarn (ou npm i)
```

## FAQ
### Pourquoi un autre bot Discord ?
Tout simplement car aucun bot actuel ne faisait ce qu'on voulait, on avait des besoins précis on y répondu en créant nous même ce bot.

### Que fait-il ?
Son but principal est de télécharger et upload les vidéos d'un lien Twitter, Reddit et TikTok pour utiliser le lecteur Discord.  
Il garde en base les roles, pseudo des personnes dans le serveur et les remets si la personne revient sur le serveur (utile lors d'un kick + invitation).  
Log les messages supprimés pour éviter les ghosts ping.  
Converti les fichiers `.webm` en `.mp4` pour lire les fichiers sur téléphone  

### Liste des commandes
- `/altcaps` ÉcRis eL mEsSaGe CoMmE çA
- `/clear` Clear le nombre de message en paramètre (1-100 messages de 14j max)
- `/log-deleted` Affiche les 8 derniers messages supprimés
- `/nsfw` Bon...
- `/ping` Envoyer des packets ICMP Echo Request à une adresse IP / nom de domaine
- `/rapti` Ressors au hasard une phrase contenant le #rapti
- `/refresh` Refresh les roles/pseudo dans la base
- `/rot13` Encoder/décoder un message en ROT13


Les autre commandes sont réservé au serveur uniquement.
