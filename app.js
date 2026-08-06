// ==================== VARIABLES GLOBALES ====================

let machines = ["Machine A", "Machine B", "Machine C"];
let pannes = [];
let pannesPlanif = [];
let pannesFiab = [];
let actionsProd = [];
let categoriesActions = ["outilleur", "devis à faire", "commande à lancer", "travaux à suivre", "Top3 sécu"];
let currentArchiveTab = 'pannes';
let panneEnCoursDArchivage = null;
let panneEnCoursDeModification = null;
let actionEnCoursDArchivage = null;
let actionEnCoursDeModification = null;
let stocks = [];
let stockChartG = null;
let stockChartF = null;
let stockEnCoursDeModification = null; // Index du stock en cours de modification

// ==================== FONCTIONS UTILITAIRES ====================

// Date du jour (YYYY-MM-DD)
function dateAujourdhui() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Formater la date (JJ/MM/AAAA)
function formaterDate(d) {
    const date = new Date(d);
    return String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
}

// Afficher une notification
function afficherNotification(message) {
    const notification = document.getElementById("notification");
    if (notification) {
        notification.textContent = message;
        notification.style.display = "block";
        setTimeout(function() { notification.style.display = "none"; }, 3000);
    }
}

// ==================== CHARGEMENT ET SAUVEGARDE ====================

// Charger les données depuis localStorage
function chargerDonnees() {
    const donneesSauvegardees = localStorage.getItem('donneesPannesFAC');
    const stocksSauvegardes = localStorage.getItem('stocksFAC');

    if (donneesSauvegardees) {
        try {
            const donnees = JSON.parse(donneesSauvegardees);
            machines = donnees.machines || ["Machine A", "Machine B", "Machine C"];
            pannes = donnees.pannes || [];
            pannesPlanif = donnees.pannesPlanif || [];
            pannesFiab = donnees.pannesFiab || [];
            actionsProd = donnees.actionsProd || [];
            categoriesActions = donnees.categoriesActions || ["outilleur", "devis à faire", "commande à lancer", "travaux à suivre", "Top3 sécu"];
        } catch (e) {
            console.error("Erreur de chargement des données :", e);
        }
    }

    if (stocksSauvegardes) {
        try {
            stocks = JSON.parse(stocksSauvegardes);
        } catch (e) {
            console.error("Erreur de chargement des stocks :", e);
            stocks = [];
        }
    }

    mettreAJourMachines();
    afficherMachines();
    afficherPannes();
    afficherPannesPlanif();
    afficherPannesFiab();
    afficherActionsProd();
    mettreAJourCategoriesActions();
    afficherStock();
    mettreAJourGraphiqueStock();
}

// Sauvegarder les données dans localStorage
function sauvegarderDonnees() {
    const donnees = {
        machines: machines,
        pannes: pannes,
        pannesPlanif: pannesPlanif,
        pannesFiab: pannesFiab,
        actionsProd: actionsProd,
        categoriesActions: categoriesActions
    };
    localStorage.setItem('donneesPannesFAC', JSON.stringify(donnees));
    localStorage.setItem('stocksFAC', JSON.stringify(stocks));
}

// ==================== MACHINES ====================

// Mettre à jour la liste déroulante des machines
function mettreAJourMachines() {
    const selectIds = ["machine", "machineAction", "modifMachine", "modifMachineAction", "modifMachinePlanif", "modifMachineFiab"];
    for (let i = 0; i < selectIds.length; i++) {
        const select = document.getElementById(selectIds[i]);
        if (select) {
            select.innerHTML = '<option value="" disabled selected>Sélectionnez une machine</option>';
            for (let j = 0; j < machines.length; j++) {
                const opt = document.createElement("option");
                opt.value = machines[j];
                opt.textContent = machines[j];
                select.appendChild(opt);
            }
        }
    }
}

// Afficher les machines
function afficherMachines() {
    const liste = document.getElementById("listeMachines");
    if (liste) {
        if (machines.length === 0) {
            liste.innerHTML = '<div class="empty-message">Aucune machine enregistrée.</div>';
        } else {
            let html = '';
            for (let i = 0; i < machines.length; i++) {
                html += '<div class="machine-item"><span>' + machines[i] + '</span><button class="delete" onclick="supprimerMachine(' + i + ')">Supprimer</button></div>';
            }
            liste.innerHTML = html;
        }
    }
    afficherCategories();
    sauvegarderDonnees();
}

// Ajouter une machine
function ajouterMachine() {
    const nom = document.getElementById("nouvelleMachine").value.trim();
    if (nom && !machines.includes(nom)) {
        machines.push(nom);
        document.getElementById("nouvelleMachine").value = "";
        mettreAJourMachines();
        afficherMachines();
        afficherNotification("Machine ajoutée !");
    } else {
        alert("Veuillez entrer un nom de machine valide et unique.");
    }
}

// Supprimer une machine
function supprimerMachine(i) {
    if (confirm("Voulez-vous vraiment supprimer la machine \"" + machines[i] + "\" ?")) {
        const machineASupprimer = machines[i];
        machines.splice(i, 1);
        for (let j = pannes.length - 1; j >= 0; j--) {
            if (pannes[j].machine === machineASupprimer) pannes.splice(j, 1);
        }
        for (let j = pannesPlanif.length - 1; j >= 0; j--) {
            if (pannesPlanif[j].machine === machineASupprimer) pannesPlanif.splice(j, 1);
        }
        for (let j = pannesFiab.length - 1; j >= 0; j--) {
            if (pannesFiab[j].machine === machineASupprimer) pannesFiab.splice(j, 1);
        }
        for (let j = actionsProd.length - 1; j >= 0; j--) {
            if (actionsProd[j].machine === machineASupprimer) actionsProd.splice(j, 1);
        }
        afficherMachines();
        mettreAJourMachines();
        afficherPannes();
        afficherPannesPlanif();
        afficherPannesFiab();
        afficherActionsProd();
        afficherNotification("Machine supprimée !");
    }
}

// ==================== CATEGORIES ====================

// Mettre à jour le select des catégories d'actions
function mettreAJourCategoriesActions() {
    const selectIds = ["typeAction", "modifTypeAction"];
    for (let i = 0; i < selectIds.length; i++) {
        const select = document.getElementById(selectIds[i]);
        if (select) {
            select.innerHTML = '';
            for (let j = 0; j < categoriesActions.length; j++) {
                const opt = document.createElement("option");
                opt.value = categoriesActions[j];
                opt.textContent = categoriesActions[j];
                select.appendChild(opt);
            }
        }
    }
}

// Afficher les catégories d'actions
function afficherCategories() {
    const liste = document.getElementById("listeCategories");
    if (liste) {
        if (categoriesActions.length === 0) {
            liste.innerHTML = '<div class="empty-message">Aucune catégorie enregistrée.</div>';
        } else {
            let html = '';
            for (let i = 0; i < categoriesActions.length; i++) {
                html += '<div class="machine-item"><span>' + categoriesActions[i] + '</span><button class="delete" onclick="supprimerCategorie(' + i + ')">Supprimer</button></div>';
            }
            liste.innerHTML = html;
        }
    }
    sauvegarderDonnees();
}

// Ajouter une catégorie
function ajouterCategorie() {
    const nom = document.getElementById("nouvelleCategorie").value.trim();
    if (nom && !categoriesActions.includes(nom)) {
        categoriesActions.push(nom);
        document.getElementById("nouvelleCategorie").value = "";
        mettreAJourCategoriesActions();
        afficherCategories();
        afficherNotification("Catégorie ajoutée !");
    } else {
        alert("Veuillez entrer un nom de catégorie valide et unique.");
    }
}

// Supprimer une catégorie
function supprimerCategorie(i) {
    if (confirm("Voulez-vous vraiment supprimer la catégorie \"" + categoriesActions[i] + "\" ?")) {
        const categorieASupprimer = categoriesActions[i];
        categoriesActions.splice(i, 1);
        if (categoriesActions.length > 0) {
            for (let j = 0; j < actionsProd.length; j++) {
                if (actionsProd[j].type === categorieASupprimer) {
                    actionsProd[j].type = categoriesActions[0];
                }
            }
        }
        afficherCategories();
        mettreAJourCategoriesActions();
        afficherActionsProd();
        afficherNotification("Catégorie supprimée !");
    }
}

// ==================== REORGANISATION DES PRIORITES ====================

// Fonction pour réorganiser les priorités (1-4 uniques par type, 5 illimité)
function reorganiserPriorites(tableau, type, nouvellePriorite, indexElement) {
    const element = tableau[indexElement];
    const anciennePriorite = element.priorite;
    if (anciennePriorite === nouvellePriorite) return;

    const elementsMemeType = [];
    for (let i = 0; i < tableau.length; i++) {
        if (i !== indexElement && tableau[i].type === type && !tableau[i].termine) {
            elementsMemeType.push(tableau[i]);
        }
    }

    if (parseInt(nouvellePriorite) >= 1 && parseInt(nouvellePriorite) <= 4) {
        const elementsADeplacer = [];
        for (let i = 0; i < elementsMemeType.length; i++) {
            if (parseInt(elementsMemeType[i].priorite) >= parseInt(nouvellePriorite)) {
                elementsADeplacer.push(elementsMemeType[i]);
            }
        }
        elementsADeplacer.sort(function(a, b) {
            return parseInt(a.priorite) - parseInt(b.priorite);
        });
        for (let i = 0; i < elementsADeplacer.length; i++) {
            const nouvelleVal = parseInt(elementsADeplacer[i].priorite) + 1;
            elementsADeplacer[i].priorite = nouvelleVal > 5 ? "5" : nouvelleVal.toString();
        }
    }
    element.priorite = nouvellePriorite;
}

// ==================== PANNES (ACCUEIL) ====================

// Afficher les pannes (non archivées)
function afficherPannes() {
    const categories = {
        mecanique: document.getElementById("listeMecanique"),
        electrique: document.getElementById("listeElectrique"),
        outilleur: document.getElementById("listeOutilleur"),
        mair: document.getElementById("listeMair"),
        prod: document.getElementById("listeProd"),
        amelio: document.getElementById("listeAmelio")
    };
    for (const key in categories) {
        if (categories[key]) categories[key].innerHTML = '';
    }

    const pannesNonTerminees = [];
    for (let i = 0; i < pannes.length; i++) {
        if (!pannes[i].termine) pannesNonTerminees.push(pannes[i]);
    }
    pannesNonTerminees.sort(function(a, b) {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        if (a.priorite !== b.priorite) return parseInt(a.priorite) - parseInt(b.priorite);
        return new Date(b.date) - new Date(a.date);
    });

    if (pannesNonTerminees.length === 0) {
        for (const key in categories) {
            if (categories[key]) categories[key].innerHTML = '<div class="empty-message">Aucune panne en cours.</div>';
        }
    } else {
        for (let i = 0; i < pannesNonTerminees.length; i++) {
            const p = pannesNonTerminees[i];
            const el = document.createElement("div");
            el.className = "panne " + p.type;
            el.innerHTML = '<div><strong>' + p.machine + '</strong> (' + formaterDate(p.date) + ')' +
                '<span class="priorite priorite-' + p.priorite + '">Priorité ' + p.priorite + '</span></div>' +
                '<div>' + p.description + '</div>' +
                '<div class="boutons-panne">' +
                '<button onclick="ouvrirModal(\'modalModification\', ' + pannes.indexOf(p) + ', \'modification\')">Modifier</button>' +
                '<button onclick="ouvrirModal(\'modalCommentaire\', ' + pannes.indexOf(p) + ', \'archivage\')">Archiver</button>' +
                '<button onclick="deplacerVersPlanif(' + pannes.indexOf(p) + ')">→ Planif</button>' +
                '<button onclick="deplacerVersFiab(' + pannes.indexOf(p) + ')">→ Fiab</button>' +
                '</div>';
            if (categories[p.type]) categories[p.type].appendChild(el);
        }
    }
    sauvegarderDonnees();
}

// Afficher l'archive des pannes
function afficherArchive() {
    const categories = {
        mecanique: document.getElementById("archiveMecanique"),
        electrique: document.getElementById("archiveElectrique"),
        outilleur: document.getElementById("archiveOutilleur"),
        mair: document.getElementById("archiveMair"),
        prod: document.getElementById("archiveProd"),
        amelio: document.getElementById("archiveAmelio")
    };
    for (const key in categories) {
        if (categories[key]) categories[key].innerHTML = '';
    }

    const pannesTerminees = [];
    for (let i = 0; i < pannes.length; i++) {
        if (pannes[i].termine) pannesTerminees.push(pannes[i]);
    }
    pannesTerminees.sort(function(a, b) {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        if (a.machine !== b.machine) return a.machine.localeCompare(b.machine);
        if (a.priorite !== b.priorite) return parseInt(a.priorite) - parseInt(b.priorite);
        return new Date(b.date) - new Date(a.date);
    });

    if (pannesTerminees.length === 0) {
        for (const key in categories) {
            if (categories[key]) categories[key].innerHTML = '<div class="empty-message">Aucune panne archivée.</div>';
        }
    } else {
        for (let i = 0; i < pannesTerminees.length; i++) {
            const p = pannesTerminees[i];
            const el = document.createElement("div");
            el.className = "panne " + p.type;
            el.innerHTML = '<div><strong>' + p.machine + '</strong> (Archivée le ' + formaterDate(p.date) + ')' +
                '<span class="priorite priorite-' + p.priorite + '">Priorité ' + p.priorite + '</span></div>' +
                '<div>' + p.description + '</div>' +
                (p.commentaire ? '<div><strong>Commentaire:</strong> ' + p.commentaire + '</div>' : '') +
                '<div class="boutons-panne">' +
                '<button class="delete" onclick="supprimerPanne(' + pannes.indexOf(p) + ')">Supprimer</button>' +
                '</div>';
            if (categories[p.type]) categories[p.type].appendChild(el);
        }
    }
    sauvegarderDonnees();
}

// Ajouter une panne
function ajouterPanne() {
    const type = document.getElementById("type").value;
    const machine = document.getElementById("machine").value;
    const desc = document.getElementById("description").value.trim();
    const priorite = document.getElementById("priorite").value;

    if (machine && desc) {
        const nouvellePanne = {
            type: type,
            machine: machine,
            description: desc,
            date: dateAujourdhui(),
            termine: false,
            commentaire: "",
            priorite: priorite
        };
        pannes.push(nouvellePanne);
        reorganiserPriorites(pannes, type, priorite, pannes.length - 1);
        document.getElementById("description").value = "";
        afficherPannes();
        afficherArchive();
        afficherNotification("Panne ajoutée !");
    } else {
        alert("Veuillez renseigner la machine et la description !");
    }
}

// Déplacer une panne vers Planif
function deplacerVersPlanif(index) {
    const panne = pannes[index];
    pannesPlanif.push({
        type: panne.type,
        machine: panne.machine,
        description: panne.description,
        date: panne.date,
        termine: false,
        commentaire: panne.commentaire,
        priorite: panne.priorite,
        dateDeplacement: dateAujourdhui()
    });
    pannes.splice(index, 1);
    afficherPannes();
    afficherPannesPlanif();
    if (currentArchiveTab === 'planif') afficherArchivePlanif();
    sauvegarderDonnees();
    afficherNotification("Panne déplacée vers Planif !");
}

// Déplacer une panne vers Fiab
function deplacerVersFiab(index) {
    const panne = pannes[index];
    pannesFiab.push({
        type: panne.type,
        machine: panne.machine,
        description: panne.description,
        date: panne.date,
        termine: false,
        commentaire: panne.commentaire,
        priorite: panne.priorite,
        dateDeplacement: dateAujourdhui()
    });
    pannes.splice(index, 1);
    afficherPannes();
    afficherPannesFiab();
    if (currentArchiveTab === 'fiab') afficherArchiveFiab();
    sauvegarderDonnees();
    afficherNotification("Panne déplacée vers Fiab !");
}

// Supprimer une panne
function supprimerPanne(i) {
    if (confirm("Voulez-vous vraiment supprimer cette panne ?")) {
        pannes.splice(i, 1);
        afficherPannes();
        afficherArchive();
        sauvegarderDonnees();
        afficherNotification("Panne supprimée !");
    }
}

// ==================== PLANIF ====================

// Afficher les pannes dans Planif
function afficherPannesPlanif() {
    const liste = document.getElementById("listePlanif");
    if (liste) {
        const pannesNonTerminees = [];
        for (let i = 0; i < pannesPlanif.length; i++) {
            if (!pannesPlanif[i].termine) pannesNonTerminees.push(pannesPlanif[i]);
        }
        pannesNonTerminees.sort(function(a, b) {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            if (a.priorite !== b.priorite) return parseInt(a.priorite) - parseInt(b.priorite);
            return new Date(b.date) - new Date(a.date);
        });

        if (pannesNonTerminees.length === 0) {
            liste.innerHTML = '<div class="empty-message">Aucune panne à planifier.</div>';
        } else {
            let html = '';
            for (let i = 0; i < pannesNonTerminees.length; i++) {
                const p = pannesNonTerminees[i];
                html += '<div class="panne ' + p.type + '">' +
                    '<div><strong>' + p.machine + '</strong> (' + formaterDate(p.date) + ')' +
                    '<span class="priorite priorite-' + p.priorite + '">Priorité ' + p.priorite + '</span></div>' +
                    '<div>' + p.description + '</div>' +
                    '<div class="boutons-panne">' +
                    '<button onclick="ouvrirModalPlanif(\'modalModificationPlanif\', ' + pannesPlanif.indexOf(p) + ', \'modification\')">Modifier</button>' +
                    '<button onclick="ouvrirModalPlanif(\'modalCommentairePlanif\', ' + pannesPlanif.indexOf(p) + ', \'archivage\')">Archiver</button>' +
                    '</div>' +
                    '</div>';
            }
            liste.innerHTML = html;
        }
    }
    sauvegarderDonnees();
}

// Afficher l'archive des pannes Planif
function afficherArchivePlanif() {
    const liste = document.getElementById("archivePlanif");
    if (liste) {
        const pannesTerminees = [];
        for (let i = 0; i < pannesPlanif.length; i++) {
            if (pannesPlanif[i].termine) pannesTerminees.push(pannesPlanif[i]);
        }
        pannesTerminees.sort(function(a, b) {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            if (a.machine !== b.machine) return a.machine.localeCompare(b.machine);
            if (a.priorite !== b.priorite) return parseInt(a.priorite) - parseInt(b.priorite);
            return new Date(b.date) - new Date(a.date);
        });

        if (pannesTerminees.length === 0) {
            liste.innerHTML = '<div class="empty-message">Aucune panne archivée dans Planif.</div>';
        } else {
            let html = '';
            for (let i = 0; i < pannesTerminees.length; i++) {
                const p = pannesTerminees[i];
                html += '<div class="panne ' + p.type + '">' +
                    '<div><strong>' + p.machine + '</strong> (Archivée le ' + formaterDate(p.date) + ')' +
                    '<span class="priorite priorite-' + p.priorite + '">Priorité ' + p.priorite + '</span></div>' +
                    '<div>' + p.description + '</div>' +
                    (p.commentaire ? '<div><strong>Commentaire:</strong> ' + p.commentaire + '</div>' : '') +
                    '<div class="boutons-panne">' +
                    '<button class="delete" onclick="supprimerPannePlanif(' + pannesPlanif.indexOf(p) + ')">Supprimer</button>' +
                    '</div>' +
                    '</div>';
            }
            liste.innerHTML = html;
        }
    }
    sauvegarderDonnees();
}

// Supprimer une panne de Planif
function supprimerPannePlanif(i) {
    if (confirm("Voulez-vous vraiment supprimer cette panne archivée ?")) {
        pannesPlanif.splice(i, 1);
        afficherArchivePlanif();
        sauvegarderDonnees();
        afficherNotification("Panne supprimée de l'archive Planif !");
    }
}

// ==================== FIAB ====================

// Afficher les pannes dans Fiab
function afficherPannesFiab() {
    const liste = document.getElementById("listeFiab");
    if (liste) {
        const pannesNonTerminees = [];
        for (let i = 0; i < pannesFiab.length; i++) {
            if (!pannesFiab[i].termine) pannesNonTerminees.push(pannesFiab[i]);
        }
        pannesNonTerminees.sort(function(a, b) {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            if (a.priorite !== b.priorite) return parseInt(a.priorite) - parseInt(b.priorite);
            return new Date(b.date) - new Date(a.date);
        });

        if (pannesNonTerminees.length === 0) {
            liste.innerHTML = '<div class="empty-message">Aucune panne en fiabilité.</div>';
        } else {
            let html = '';
            for (let i = 0; i < pannesNonTerminees.length; i++) {
                const p = pannesNonTerminees[i];
                html += '<div class="panne ' + p.type + '">' +
                    '<div><strong>' + p.machine + '</strong> (' + formaterDate(p.date) + ')' +
                    '<span class="priorite priorite-' + p.priorite + '">Priorité ' + p.priorite + '</span></div>' +
                    '<div>' + p.description + '</div>' +
                    '<div class="boutons-panne">' +
                    '<button onclick="ouvrirModalFiab(\'modalModificationFiab\', ' + pannesFiab.indexOf(p) + ', \'modification\')">Modifier</button>' +
                    '<button onclick="ouvrirModalFiab(\'modalCommentaireFiab\', ' + pannesFiab.indexOf(p) + ', \'archivage\')">Archiver</button>' +
                    '</div>' +
                    '</div>';
            }
            liste.innerHTML = html;
        }
    }
    sauvegarderDonnees();
}

// Afficher l'archive des pannes Fiab
function afficherArchiveFiab() {
    const liste = document.getElementById("archiveFiab");
    if (liste) {
        const pannesTerminees = [];
        for (let i = 0; i < pannesFiab.length; i++) {
            if (pannesFiab[i].termine) pannesTerminees.push(pannesFiab[i]);
        }
        pannesTerminees.sort(function(a, b) {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            if (a.machine !== b.machine) return a.machine.localeCompare(b.machine);
            if (a.priorite !== b.priorite) return parseInt(a.priorite) - parseInt(b.priorite);
            return new Date(b.date) - new Date(a.date);
        });

        if (pannesTerminees.length === 0) {
            liste.innerHTML = '<div class="empty-message">Aucune panne archivée dans Fiab.</div>';
        } else {
            let html = '';
            for (let i = 0; i < pannesTerminees.length; i++) {
                const p = pannesTerminees[i];
                html += '<div class="panne ' + p.type + '">' +
                    '<div><strong>' + p.machine + '</strong> (Archivée le ' + formaterDate(p.date) + ')' +
                    '<span class="priorite priorite-' + p.priorite + '">Priorité ' + p.priorite + '</span></div>' +
                    '<div>' + p.description + '</div>' +
                    (p.commentaire ? '<div><strong>Commentaire:</strong> ' + p.commentaire + '</div>' : '') +
                    '<div class="boutons-panne">' +
                    '<button class="delete" onclick="supprimerPanneFiab(' + pannesFiab.indexOf(p) + ')">Supprimer</button>' +
                    '</div>' +
                    '</div>';
            }
            liste.innerHTML = html;
        }
    }
    sauvegarderDonnees();
}

// Supprimer une panne de Fiab
function supprimerPanneFiab(i) {
    if (confirm("Voulez-vous vraiment supprimer cette panne archivée ?")) {
        pannesFiab.splice(i, 1);
        afficherArchiveFiab();
        sauvegarderDonnees();
        afficherNotification("Panne supprimée de l'archive Fiab !");
    }
}

// ==================== ACTIONS PROD ====================

// Ajouter une action (page Prod)
function ajouterAction() {
    const type = document.getElementById("typeAction").value;
    const machine = document.getElementById("machineAction").value;
    const desc = document.getElementById("descriptionAction").value.trim();
    const priorite = document.getElementById("prioriteAction").value;

    if (machine && desc) {
        const nouvelleAction = {
            type: type,
            machine: machine,
            description: desc,
            date: dateAujourdhui(),
            termine: false,
            commentaire: "",
            priorite: priorite
        };
        actionsProd.push(nouvelleAction);
        reorganiserPriorites(actionsProd, type, priorite, actionsProd.length - 1);
        document.getElementById("descriptionAction").value = "";
        afficherActionsProd();
        if (currentArchiveTab === 'prod') afficherArchiveProd();
        sauvegarderDonnees();
        afficherNotification("Action ajoutée !");
    } else {
        alert("Veuillez renseigner la machine et la description !");
    }
}

// Afficher les actions (page Prod)
function afficherActionsProd() {
    const categories = {
        outilleur: document.getElementById("listeOutilleurActions"),
        "devis à faire": document.getElementById("listeDevisActions"),
        "commande à lancer": document.getElementById("listeCommandeActions"),
        "travaux à suivre": document.getElementById("listeTravauxActions"),
        "Top3 sécu": document.getElementById("listeTop3Actions")
    };
    for (const key in categories) {
        if (categories[key]) categories[key].innerHTML = '';
    }

    const actionsNonTerminees = [];
    for (let i = 0; i < actionsProd.length; i++) {
        if (!actionsProd[i].termine) actionsNonTerminees.push(actionsProd[i]);
    }
    actionsNonTerminees.sort(function(a, b) {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        if (a.priorite !== b.priorite) return parseInt(a.priorite) - parseInt(b.priorite);
        return new Date(b.date) - new Date(a.date);
    });

    if (actionsNonTerminees.length === 0) {
        for (const key in categories) {
            if (categories[key]) categories[key].innerHTML = '<div class="empty-message">Aucune action en cours.</div>';
        }
    } else {
        for (let i = 0; i < actionsNonTerminees.length; i++) {
            const a = actionsNonTerminees[i];
            const el = document.createElement("div");
            const className = "action " + a.type.replace(/\s+/g, '-') + "-action";
            el.className = className;
            el.innerHTML = '<div><strong>' + a.machine + '</strong> (' + formaterDate(a.date) + ')' +
                '<span class="priorite priorite-' + a.priorite + '">Priorité ' + a.priorite + '</span></div>' +
                '<div>' + a.description + '</div>' +
                '<div class="boutons-panne">' +
                '<button onclick="ouvrirModalAction(\'modalModificationAction\', ' + actionsProd.indexOf(a) + ', \'modification\')">Modifier</button>' +
                '<button onclick="ouvrirModalAction(\'modalCommentaireAction\', ' + actionsProd.indexOf(a) + ', \'archivage\')">Archiver</button>' +
                '</div>';
            if (categories[a.type]) categories[a.type].appendChild(el);
        }
    }
    sauvegarderDonnees();
}

// Afficher l'archive des actions Prod
function afficherArchiveProd() {
    const categories = {
        outilleur: document.getElementById("archiveOutilleurActions"),
        "devis à faire": document.getElementById("archiveDevisActions"),
        "commande à lancer": document.getElementById("archiveCommandeActions"),
        "travaux à suivre": document.getElementById("archiveTravauxActions"),
        "Top3 sécu": document.getElementById("archiveTop3Actions")
    };
    for (const key in categories) {
        if (categories[key]) categories[key].innerHTML = '';
    }

    const actionsTerminees = [];
    for (let i = 0; i < actionsProd.length; i++) {
        if (actionsProd[i].termine) actionsTerminees.push(actionsProd[i]);
    }
    actionsTerminees.sort(function(a, b) {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        if (a.machine !== b.machine) return a.machine.localeCompare(b.machine);
        if (a.priorite !== b.priorite) return parseInt(a.priorite) - parseInt(b.priorite);
        return new Date(b.date) - new Date(a.date);
    });

    if (actionsTerminees.length === 0) {
        for (const key in categories) {
            if (categories[key]) categories[key].innerHTML = '<div class="empty-message">Aucune action archivée.</div>';
        }
    } else {
        for (let i = 0; i < actionsTerminees.length; i++) {
            const a = actionsTerminees[i];
            const el = document.createElement("div");
            const className = "action " + a.type.replace(/\s+/g, '-') + "-action";
            el.className = className;
            el.innerHTML = '<div><strong>' + a.machine + '</strong> (Archivée le ' + formaterDate(a.date) + ')' +
                '<span class="priorite priorite-' + a.priorite + '">Priorité ' + a.priorite + '</span></div>' +
                '<div>' + a.description + '</div>' +
                (a.commentaire ? '<div><strong>Commentaire:</strong> ' + a.commentaire + '</div>' : '') +
                '<div class="boutons-panne">' +
                '<button class="delete" onclick="supprimerAction(' + actionsProd.indexOf(a) + ')">Supprimer</button>' +
                '</div>';
            if (categories[a.type]) categories[a.type].appendChild(el);
        }
    }
    sauvegarderDonnees();
}

// Supprimer une action de Prod
function supprimerAction(i) {
    if (confirm("Voulez-vous vraiment supprimer cette action archivée ?")) {
        actionsProd.splice(i, 1);
        afficherArchiveProd();
        sauvegarderDonnees();
        afficherNotification("Action supprimée de l'archive Prod !");
    }
}

// ==================== MODALES ====================

// Ouvrir une modale pour les pannes
function ouvrirModal(modalId, index, type) {
    if (type === 'archivage') {
        panneEnCoursDArchivage = index;
        document.getElementById("commentaireArchivage").value = pannes[index].commentaire || "";
    } else if (type === 'modification') {
        panneEnCoursDeModification = index;
        const panne = pannes[index];
        document.getElementById("modifType").value = panne.type;
        document.getElementById("modifDescription").value = panne.description;
        document.getElementById("modifPriorite").value = panne.priorite;
        const selectMachine = document.getElementById("modifMachine");
        if (selectMachine) {
            selectMachine.innerHTML = '';
            for (let i = 0; i < machines.length; i++) {
                const opt = document.createElement("option");
                opt.value = machines[i];
                opt.textContent = machines[i];
                if (machines[i] === panne.machine) opt.selected = true;
                selectMachine.appendChild(opt);
            }
        }
    }
    if (document.getElementById(modalId)) {
        document.getElementById(modalId).style.display = "flex";
    }
}

// Ouvrir une modale pour Planif
function ouvrirModalPlanif(modalId, index, type) {
    if (type === 'archivage') {
        panneEnCoursDArchivage = index;
        document.getElementById("commentaireArchivagePlanif").value = pannesPlanif[index].commentaire || "";
    } else if (type === 'modification') {
        panneEnCoursDeModification = index;
        const panne = pannesPlanif[index];
        document.getElementById("modifTypePlanif").value = panne.type;
        document.getElementById("modifDescriptionPlanif").value = panne.description;
        document.getElementById("modifPrioritePlanif").value = panne.priorite;
        const selectMachine = document.getElementById("modifMachinePlanif");
        if (selectMachine) {
            selectMachine.innerHTML = '';
            for (let i = 0; i < machines.length; i++) {
                const opt = document.createElement("option");
                opt.value = machines[i];
                opt.textContent = machines[i];
                if (machines[i] === panne.machine) opt.selected = true;
                selectMachine.appendChild(opt);
            }
        }
    }
    if (document.getElementById(modalId)) {
        document.getElementById(modalId).style.display = "flex";
    }
}

// Ouvrir une modale pour Fiab
function ouvrirModalFiab(modalId, index, type) {
    if (type === 'archivage') {
        panneEnCoursDArchivage = index;
        document.getElementById("commentaireArchivageFiab").value = pannesFiab[index].commentaire || "";
    } else if (type === 'modification') {
        panneEnCoursDeModification = index;
        const panne = pannesFiab[index];
        document.getElementById("modifTypeFiab").value = panne.type;
        document.getElementById("modifDescriptionFiab").value = panne.description;
        document.getElementById("modifPrioriteFiab").value = panne.priorite;
        const selectMachine = document.getElementById("modifMachineFiab");
        if (selectMachine) {
            selectMachine.innerHTML = '';
            for (let i = 0; i < machines.length; i++) {
                const opt = document.createElement("option");
                opt.value = machines[i];
                opt.textContent = machines[i];
                if (machines[i] === panne.machine) opt.selected = true;
                selectMachine.appendChild(opt);
            }
        }
    }
    if (document.getElementById(modalId)) {
        document.getElementById(modalId).style.display = "flex";
    }
}

// Ouvrir une modale pour les actions (Prod)
function ouvrirModalAction(modalId, index, type) {
    if (type === 'archivage') {
        actionEnCoursDArchivage = index;
        document.getElementById("commentaireArchivageAction").value = actionsProd[index].commentaire || "";
    } else if (type === 'modification') {
        actionEnCoursDeModification = index;
        const action = actionsProd[index];
        document.getElementById("modifTypeAction").value = action.type;
        document.getElementById("modifDescriptionAction").value = action.description;
        document.getElementById("modifPrioriteAction").value = action.priorite;
        const selectMachine = document.getElementById("modifMachineAction");
        if (selectMachine) {
            selectMachine.innerHTML = '';
            for (let i = 0; i < machines.length; i++) {
                const opt = document.createElement("option");
                opt.value = machines[i];
                opt.textContent = machines[i];
                if (machines[i] === action.machine) opt.selected = true;
                selectMachine.appendChild(opt);
            }
        }
    }
    if (document.getElementById(modalId)) {
        document.getElementById(modalId).style.display = "flex";
    }
}

// Fermer une modale
function fermerModal(modalId) {
    if (document.getElementById(modalId)) {
        document.getElementById(modalId).style.display = "none";
    }
    panneEnCoursDArchivage = null;
    panneEnCoursDeModification = null;
    actionEnCoursDArchivage = null;
    actionEnCoursDeModification = null;
}

// ==================== CONFIRMATIONS ====================

// Confirmer l'archivage avec commentaire (Pannes)
function confirmerArchivageAvecCommentaire() {
    if (panneEnCoursDArchivage !== null) {
        const commentaire = document.getElementById("commentaireArchivage").value.trim();
        pannes[panneEnCoursDArchivage].termine = true;
        pannes[panneEnCoursDArchivage].commentaire = commentaire;
        fermerModal('modalCommentaire');
        afficherPannes();
        afficherArchive();
        sauvegarderDonnees();
        afficherNotification("Panne archivée avec commentaire !");
    }
}

// Confirmer l'archivage avec commentaire (Planif)
function confirmerArchivagePlanifAvecCommentaire() {
    if (panneEnCoursDArchivage !== null) {
        const commentaire = document.getElementById("commentaireArchivagePlanif").value.trim();
        pannesPlanif[panneEnCoursDArchivage].termine = true;
        pannesPlanif[panneEnCoursDArchivage].commentaire = commentaire;
        fermerModal('modalCommentairePlanif');
        afficherPannesPlanif();
        if (currentArchiveTab === 'planif') afficherArchivePlanif();
        sauvegarderDonnees();
        afficherNotification("Panne archivée dans Planif avec commentaire !");
    }
}

// Confirmer l'archivage avec commentaire (Fiab)
function confirmerArchivageFiabAvecCommentaire() {
    if (panneEnCoursDArchivage !== null) {
        const commentaire = document.getElementById("commentaireArchivageFiab").value.trim();
        pannesFiab[panneEnCoursDArchivage].termine = true;
        pannesFiab[panneEnCoursDArchivage].commentaire = commentaire;
        fermerModal('modalCommentaireFiab');
        afficherPannesFiab();
        if (currentArchiveTab === 'fiab') afficherArchiveFiab();
        sauvegarderDonnees();
        afficherNotification("Panne archivée dans Fiab avec commentaire !");
    }
}

// Confirmer l'archivage avec commentaire (Actions)
function confirmerArchivageActionAvecCommentaire() {
    if (actionEnCoursDArchivage !== null) {
        const commentaire = document.getElementById("commentaireArchivageAction").value.trim();
        actionsProd[actionEnCoursDArchivage].termine = true;
        actionsProd[actionEnCoursDArchivage].commentaire = commentaire;
        fermerModal('modalCommentaireAction');
        afficherActionsProd();
        if (currentArchiveTab === 'prod') afficherArchiveProd();
        sauvegarderDonnees();
        afficherNotification("Action archivée avec commentaire !");
    }
}

// Confirmer la modification (Pannes)
function confirmerModification() {
    if (panneEnCoursDeModification !== null) {
        const type = document.getElementById("modifType").value;
        const machine = document.getElementById("modifMachine").value;
        const description = document.getElementById("modifDescription").value.trim();
        const nouvellePriorite = document.getElementById("modifPriorite").value;

        if (machine && description) {
            const index = panneEnCoursDeModification;
            const anciennePriorite = pannes[index].priorite;
            const ancienType = pannes[index].type;

            if (nouvellePriorite !== anciennePriorite || type !== ancienType) {
                if (type !== ancienType) {
                    reorganiserPriorites(pannes, ancienType, anciennePriorite, index);
                }
                reorganiserPriorites(pannes, type, nouvellePriorite, index);
            }

            pannes[index].type = type;
            pannes[index].machine = machine;
            pannes[index].description = description;
            pannes[index].priorite = nouvellePriorite;
            pannes[index].date = dateAujourdhui();

            fermerModal('modalModification');
            afficherPannes();
            afficherArchive();
            sauvegarderDonnees();
            afficherNotification("Panne modifiée !");
        } else {
            alert("Veuillez renseigner la machine et la description !");
        }
    }
}

// Confirmer la modification (Planif)
function confirmerModificationPlanif() {
    if (panneEnCoursDeModification !== null) {
        const type = document.getElementById("modifTypePlanif").value;
        const machine = document.getElementById("modifMachinePlanif").value;
        const description = document.getElementById("modifDescriptionPlanif").value.trim();
        const nouvellePriorite = document.getElementById("modifPrioritePlanif").value;

        if (machine && description) {
            const index = panneEnCoursDeModification;
            const anciennePriorite = pannesPlanif[index].priorite;
            const ancienType = pannesPlanif[index].type;

            if (nouvellePriorite !== anciennePriorite || type !== ancienType) {
                if (type !== ancienType) {
                    reorganiserPriorites(pannesPlanif, ancienType, anciennePriorite, index);
                }
                reorganiserPriorites(pannesPlanif, type, nouvellePriorite, index);
            }

            pannesPlanif[index].type = type;
            pannesPlanif[index].machine = machine;
            pannesPlanif[index].description = description;
            pannesPlanif[index].priorite = nouvellePriorite;
            pannesPlanif[index].date = dateAujourdhui();

            fermerModal('modalModificationPlanif');
            afficherPannesPlanif();
            if (currentArchiveTab === 'planif') afficherArchivePlanif();
            sauvegarderDonnees();
            afficherNotification("Panne Planif modifiée !");
        } else {
            alert("Veuillez renseigner la machine et la description !");
        }
    }
}

// Confirmer la modification (Fiab)
function confirmerModificationFiab() {
    if (panneEnCoursDeModification !== null) {
        const type = document.getElementById("modifTypeFiab").value;
        const machine = document.getElementById("modifMachineFiab").value;
        const description = document.getElementById("modifDescriptionFiab").value.trim();
        const nouvellePriorite = document.getElementById("modifPrioriteFiab").value;

        if (machine && description) {
            const index = panneEnCoursDeModification;
            const anciennePriorite = pannesFiab[index].priorite;
            const ancienType = pannesFiab[index].type;

            if (nouvellePriorite !== anciennePriorite || type !== ancienType) {
                if (type !== ancienType) {
                    reorganiserPriorites(pannesFiab, ancienType, anciennePriorite, index);
                }
                reorganiserPriorites(pannesFiab, type, nouvellePriorite, index);
            }

            pannesFiab[index].type = type;
            pannesFiab[index].machine = machine;
            pannesFiab[index].description = description;
            pannesFiab[index].priorite = nouvellePriorite;
            pannesFiab[index].date = dateAujourdhui();

            fermerModal('modalModificationFiab');
            afficherPannesFiab();
            if (currentArchiveTab === 'fiab') afficherArchiveFiab();
            sauvegarderDonnees();
            afficherNotification("Panne Fiab modifiée !");
        } else {
            alert("Veuillez renseigner la machine et la description !");
        }
    }
}

// Confirmer la modification (Actions)
function confirmerModificationAction() {
    if (actionEnCoursDeModification !== null) {
        const type = document.getElementById("modifTypeAction").value;
        const machine = document.getElementById("modifMachineAction").value;
        const description = document.getElementById("modifDescriptionAction").value.trim();
        const nouvellePriorite = document.getElementById("modifPrioriteAction").value;

        if (machine && description) {
            const index = actionEnCoursDeModification;
            const anciennePriorite = actionsProd[index].priorite;
            const ancienType = actionsProd[index].type;

            if (nouvellePriorite !== anciennePriorite || type !== ancienType) {
                if (type !== ancienType) {
                    reorganiserPriorites(actionsProd, ancienType, anciennePriorite, index);
                }
                reorganiserPriorites(actionsProd, type, nouvellePriorite, index);
            }

            actionsProd[index].type = type;
            actionsProd[index].machine = machine;
            actionsProd[index].description = description;
            actionsProd[index].priorite = nouvellePriorite;
            actionsProd[index].date = dateAujourdhui();

            fermerModal('modalModificationAction');
            afficherActionsProd();
            if (currentArchiveTab === 'prod') afficherArchiveProd();
            sauvegarderDonnees();
            afficherNotification("Action modifiée !");
        } else {
            alert("Veuillez renseigner la machine et la description !");
        }
    }
}

// ==================== NAVIGATION ====================

// Afficher un onglet spécifique dans l'archive
function showArchiveTab(tabId) {
    const contents = document.querySelectorAll('.archive-content');
    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active');
    }
    const activeContent = document.getElementById('archive-' + tabId);
    if (activeContent) activeContent.classList.add('active');

    const tabs = document.querySelectorAll('.archive-tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    const activeTab = document.getElementById('btnArchive' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
    if (activeTab) activeTab.classList.add('active');

    if (tabId === 'pannes') {
        afficherArchive();
    } else if (tabId === 'planif') {
        afficherArchivePlanif();
    } else if (tabId === 'fiab') {
        afficherArchiveFiab();
    } else if (tabId === 'prod') {
        afficherArchiveProd();
    }
    currentArchiveTab = tabId;
}

// Changer de page
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    const activePage = document.getElementById(pageId);
    if (activePage) activePage.classList.add('active');

    const navButtons = document.querySelectorAll('.nav button');
    for (let i = 0; i < navButtons.length; i++) {
        navButtons[i].classList.remove('active');
    }
    const activeButton = document.getElementById('btn' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
    if (activeButton) activeButton.classList.add('active');

    if (pageId === 'machines') {
        afficherMachines();
    } else if (pageId === 'archive') {
        showArchiveTab('pannes');
    } else if (pageId === 'planif') {
        afficherPannesPlanif();
    } else if (pageId === 'fiab') {
        afficherPannesFiab();
    } else if (pageId === 'prod') {
        afficherActionsProd();
    } else if (pageId === 'stock') {
        afficherStock();
        mettreAJourGraphiqueStock();
    } else {
        afficherPannes();
    }
}

// ==================== EXPORT/IMPORT ====================

// Exporter en CSV
function exporterEnCSV() {
    let csv = "Type;Machine;Description;Date;Statut;Priorité;Commentaire\n";
    for (let i = 0; i < pannes.length; i++) {
        const p = pannes[i];
        const statut = p.termine ? "Archivée" : "En cours";
        const description = '"' + p.description.replace(/"/g, '""') + '"';
        const commentaire = '"' + (p.commentaire || "").replace(/"/g, '""') + '"';
        csv += p.type + ";" + p.machine + ";" + description + ";" + p.date + ";" + statut + ";" + p.priorite + ";" + commentaire + "\n";
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pannes-fac-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Importer depuis CSV
function importerDepuisCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const lignes = e.target.result.split('\n');
            if (lignes.length < 2 || !lignes[0].includes("Type;Machine;Description;Date;Statut;Priorité;Commentaire")) {
                alert("❌ Format CSV invalide. Utilisez le modèle exporté.");
                return;
            }
            const nouvellesPannes = [];
            for (let i = 1; i < lignes.length; i++) {
                if (lignes[i].trim() === "") continue;
                const valeurs = lignes[i].split(';');
                if (valeurs.length >= 7) {
                    nouvellesPannes.push({
                        type: valeurs[0].trim(),
                        machine: valeurs[1].trim(),
                        description: valeurs[2].trim().replace(/^"|"$/g, ''),
                        date: valeurs[3].trim(),
                        termine: valeurs[4].trim() === "Archivée",
                        priorite: valeurs[5].trim(),
                        commentaire: valeurs[6].trim().replace(/^"|"$/g, '')
                    });
                }
            }
            pannes = nouvellesPannes;
            const machinesUniques = [];
            for (let i = 0; i < pannes.length; i++) {
                if (!machinesUniques.includes(pannes[i].machine)) {
                    machinesUniques.push(pannes[i].machine);
                }
            }
            machines = machinesUniques.length > 0 ? machinesUniques : ["Machine A", "Machine B", "Machine C"];
            mettreAJourMachines();
            afficherMachines();
            afficherPannes();
            afficherArchive();
            sauvegarderDonnees();
            afficherNotification("Données importées avec succès !");
        } catch (error) {
            alert("❌ Erreur lors de l'importation.");
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ==================== STOCK ====================

// Exporter les stocks en CSV
function exporterStockEnCSV() {
    let csv = "Date;G Crue;F Crue;G Cuite;F Cuite\n";
    for (let i = 0; i < stocks.length; i++) {
        const s = stocks[i];
        csv += '"' + s.date + '";"' + (s.gCrue || '') + '";"' + (s.fCrue || '') + '";"' + (s.gCuite || '') + '";"' + (s.fCuite || '') + "\n";
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stocks-fac-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Importer les stocks depuis CSV
function importerStockDepuisCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const lignes = e.target.result.split('\n');
            if (lignes.length < 2 || !lignes[0].includes("Date;G Crue;F Crue;G Cuite;F Cuite")) {
                alert("❌ Format CSV invalide pour les stocks. Utilisez le modèle exporté.");
                return;
            }
            const nouveauxStocks = [];
            for (let i = 1; i < lignes.length; i++) {
                if (lignes[i].trim() === "") continue;
                const valeurs = lignes[i].split(';');
                if (valeurs.length >= 5) {
                    nouveauxStocks.push({
                        date: valeurs[0].trim().replace(/^"|"$/g, ''),
                        gCrue: valeurs[1].trim().replace(/^"|"$/g, ''),
                        fCrue: valeurs[2].trim().replace(/^"|"$/g, ''),
                        gCuite: valeurs[3].trim().replace(/^"|"$/g, ''),
                        fCuite: valeurs[4].trim().replace(/^"|"$/g, '')
                    });
                }
            }
            stocks = nouveauxStocks;
            sauvegarderDonnees();
            afficherStock();
            mettreAJourGraphiqueStock();
            afficherNotification("Stocks importés avec succès !");
        } catch (error) {
            alert("❌ Erreur lors de l'importation des stocks.");
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Afficher la page Stock
function afficherStock() {
    // Mettre à jour la date du jour
    document.getElementById("dateStock").textContent = formaterDate(dateAujourdhui());

    // Afficher l'historique des stocks
    const listeStock = document.getElementById("listeStock");
    if (listeStock) {
        if (stocks.length === 0) {
            listeStock.innerHTML = '<div class="empty-message">Aucun stock enregistré.</div>';
        } else {
            let html = '<table style="width: 100%; border-collapse: collapse;">' +
                       '<tr style="background-color: #f2f2f2;">' +
                       '<th style="padding: 8px; border: 1px solid #ddd;">Date</th>' +
                       '<th style="padding: 8px; border: 1px solid #ddd;">G Crue</th>' +
                       '<th style="padding: 8px; border: 1px solid #ddd;">F Crue</th>' +
                       '<th style="padding: 8px; border: 1px solid #ddd;">G Cuite</th>' +
                       '<th style="padding: 8px; border: 1px solid #ddd;">F Cuite</th>' +
                       '<th style="padding: 8px; border: 1px solid #ddd;">Actions</th>' +
                       '</tr>';

            // Trier les stocks par date (du plus récent au plus ancien)
            const stocksTriees = [...stocks].sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            for (let i = 0; i < stocksTriees.length; i++) {
                const s = stocksTriees[i];
                html += '<tr style="border: 1px solid #ddd;">' +
                       '<td style="padding: 8px; border: 1px solid #ddd;">' + formaterDate(s.date) + '</td>' +
                       '<td style="padding: 8px; border: 1px solid #ddd;">' + s.gCrue + '</td>' +
                       '<td style="padding: 8px; border: 1px solid #ddd;">' + s.fCrue + '</td>' +
                       '<td style="padding: 8px; border: 1px solid #ddd;">' + s.gCuite + '</td>' +
                       '<td style="padding: 8px; border: 1px solid #ddd;">' + s.fCuite + '</td>' +
                       '<td style="padding: 8px; border: 1px solid #ddd;">' +
                       '<button class="secondary" onclick="ouvrirModalModifStock(' + stocks.indexOf(s) + ')">Modifier</button>' +
                       '<button class="delete" onclick="supprimerStock(' + stocks.indexOf(s) + ')">Supprimer</button>' +
                       '</td>' +
                       '</tr>';
            }
            html += '</table>';
            listeStock.innerHTML = html;
        }
    }
}

// Enregistrer le stock du jour et envoyer par email
function enregistrerStock() {
    const gCrue = document.getElementById("gCrue").value.trim();
    const fCrue = document.getElementById("fCrue").value.trim();
    const gCuite = document.getElementById("gCuite").value.trim();
    const fCuite = document.getElementById("fCuite").value.trim();

    if (!gCrue || !fCrue || !gCuite || !fCuite) {
        alert("Veuillez renseigner toutes les valeurs de stock !");
        return;
    }

    // Créer un nouvel enregistrement de stock
    const nouveauStock = {
        date: dateAujourdhui(),
        gCrue: gCrue,
        fCrue: fCrue,
        gCuite: gCuite,
        fCuite: fCuite
    };

    // Vérifier si un stock existe déjà pour aujourd'hui
    const stockExistantIndex = stocks.findIndex(s => s.date === dateAujourdhui());
    if (stockExistantIndex !== -1) {
        // Mettre à jour le stock existant
        stocks[stockExistantIndex] = nouveauStock;
    } else {
        // Ajouter le nouveau stock
        stocks.push(nouveauStock);
    }

    // Sauvegarder et afficher
    sauvegarderDonnees();
    afficherStock();
    mettreAJourGraphiqueStock();

    // Préparer le corps de l'email
    const emailBody = "Stocks du " + formaterDate(dateAujourdhui()) + ":\n\n" +
                     "G Crue: " + gCrue + "\n" +
                     "F Crue: " + fCrue + "\n" +
                     "G Cuite: " + gCuite + "\n" +
                     "F Cuite: " + fCuite + "\n\n" +
                     "Envoyé depuis l'application Gestion des Pannes - FAC";

    // Encoder le sujet et le corps pour le lien mailto
    const subject = encodeURIComponent("Stocks du " + formaterDate(dateAujourdhui()) + " - FAC");
    const body = encodeURIComponent(emailBody);

    // Ouvrir Gmail avec le sujet et le corps
    window.location.href = "mailto:?subject=" + subject + "&body=" + body;

    // Réinitialiser les champs
    document.getElementById("gCrue").value = "";
    document.getElementById("fCrue").value = "";
    document.getElementById("gCuite").value = "";
    document.getElementById("fCuite").value = "";

    afficherNotification("Stock enregistré et email prêt à être envoyé via Gmail !");
}

// Supprimer un enregistrement de stock
function supprimerStock(i) {
    if (confirm("Voulez-vous vraiment supprimer cet enregistrement de stock ?")) {
        stocks.splice(i, 1);
        sauvegarderDonnees();
        afficherStock();
        mettreAJourGraphiqueStock();
        afficherNotification("Stock supprimé !");
    }
}


// ==================== MODIFICATION STOCK ====================

// Ouvrir modale pour modifier un stock
function ouvrirModalModifStock(index) {
    stockEnCoursDeModification = index;
    const s = stocks[index];
    document.getElementById('modifDateStock').value = s.date;
    document.getElementById('modifGCrue').value = s.gCrue;
    document.getElementById('modifFCrue').value = s.fCrue;
    document.getElementById('modifGCuite').value = s.gCuite;
    document.getElementById('modifFCuite').value = s.fCuite;
    document.getElementById('modalModifStock').style.display = 'flex';
}

// Fermer modale de modification de stock
function fermerModalModifStock() {
    document.getElementById('modalModifStock').style.display = 'none';
    stockEnCoursDeModification = null;
}

// Confirmer la modification d'un stock
function confirmerModifStock() {
    if (stockEnCoursDeModification !== null) {
        const date = document.getElementById('modifDateStock').value;
        const gCrue = document.getElementById('modifGCrue').value;
        const fCrue = document.getElementById('modifFCrue').value;
        const gCuite = document.getElementById('modifGCuite').value;
        const fCuite = document.getElementById('modifFCuite').value;

        if (date && gCrue && fCrue && gCuite && fCuite) {
            stocks[stockEnCoursDeModification] = {
                date: date,
                gCrue: gCrue,
                fCrue: fCrue,
                gCuite: gCuite,
                fCuite: fCuite
            };
            fermerModalModifStock();
            sauvegarderDonnees();
            afficherStock();
            mettreAJourGraphiqueStock();
            afficherNotification('Stock modifié avec succès !');
        } else {
            alert('Veuillez renseigner tous les champs !');
        }
    }
}

// Mettre à jour les graphiques des stocks
function mettreAJourGraphiqueStock() {
    const graphiqueStock = document.getElementById("graphiqueStock");
    if (!stocks.length) {
        // Si aucun stock, afficher un message
        if (graphiqueStock) {
            graphiqueStock.innerHTML = '<div class="empty-message">Aucun stock enregistré pour afficher les graphiques.</div>';
        }
        return;
    }
    
    // Si on a des stocks, s'assurer que le conteneur est vide pour les graphiques
    if (graphiqueStock) {
        graphiqueStock.innerHTML = `
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 400px;">
                    <h3>Stocks G (Crue et Cuite)</h3>
                    <canvas id="stockChartG"></canvas>
                </div>
                <div style="flex: 1; min-width: 400px;">
                    <h3>Stocks F (Crue et Cuite)</h3>
                    <canvas id="stockChartF"></canvas>
                </div>
            </div>
        `;
    }

    // Trier les stocks par date
    const stocksTriees = [...stocks].sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    // Extraire les dates et les valeurs
    const dates = stocksTriees.map(s => formaterDate(s.date));
    const gCrueData = stocksTriees.map(s => parseInt(s.gCrue) || 0);
    const fCrueData = stocksTriees.map(s => parseInt(s.fCrue) || 0);
    const gCuiteData = stocksTriees.map(s => parseInt(s.gCuite) || 0);
    const fCuiteData = stocksTriees.map(s => parseInt(s.fCuite) || 0);

    // Créer ou mettre à jour le graphique pour G (Crue et Cuite)
    const ctxG = document.getElementById('stockChartG');
    if (ctxG) {
        if (stockChartG) {
            stockChartG.destroy();
        }

        stockChartG = new Chart(ctxG, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'G Crue',
                        data: gCrueData,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        tension: 0.1,
                        fill: false
                    },
                    {
                        label: 'G Cuite',
                        data: gCuiteData,
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        tension: 0.1,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantité'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution des stocks G',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    }

    // Créer ou mettre à jour le graphique pour F (Crue et Cuite)
    const ctxF = document.getElementById('stockChartF');
    if (ctxF) {
        if (stockChartF) {
            stockChartF.destroy();
        }

        stockChartF = new Chart(ctxF, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'F Crue',
                        data: fCrueData,
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        tension: 0.1,
                        fill: false
                    },
                    {
                        label: 'F Cuite',
                        data: fCuiteData,
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        tension: 0.1,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantité'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution des stocks F',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    }
}

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', function() {
    chargerDonnees();
});

window.addEventListener('beforeunload', sauvegarderDonnees);
