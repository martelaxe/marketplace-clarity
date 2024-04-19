;; sip009-nft
;; A SIP009-compliant NFT with a mint function.

(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-constant contract-owner tx-sender)

(define-constant err-owner-only (err u100))
(define-constant err-token-id-failure (err u101))
(define-constant err-not-token-owner (err u102))
(define-constant err-max-mints-reached (err u103))



(define-data-var is-finite bool false)
(define-data-var max-mints (optional uint) none)
(define-data-var current-mints uint u0)
(define-data-var initialized bool false)  ;; Add this variable to track if initialization has happened


(define-non-fungible-token stacksies uint)
(define-data-var token-id-nonce uint u0)

(define-read-only (get-last-token-id)
	(ok (var-get token-id-nonce))
)



(define-read-only (get-token-uri (token-id uint))
	(ok none)
)

(define-read-only (get-owner (token-id uint))
	(ok (nft-get-owner? stacksies token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
	(begin
		(asserts! (is-eq tx-sender sender) err-not-token-owner)
		(nft-transfer? stacksies token-id sender recipient)
	)
)

(define-public (initialize-minting-parameters (finite bool) (max (optional uint)))
    (begin
        ;; Ensure only the contract owner can call this function and only once
        (asserts! (is-eq tx-sender contract-owner) (err u401))  ;; Check for owner
        (asserts! (not (var-get initialized)) (err u402))  ;; Check if already initialized

        ;; Set the initial minting parameters
        (var-set is-finite finite)
        (var-set max-mints max)
        (var-set current-mints u0)
        (var-set token-id-nonce u0)

        ;; Set the initialized flag to true
        (var-set initialized true)

        ;; Confirm initialization
        (ok true)
    )
)

(define-public (change-max-mints (new-max-mints (optional uint)))
    (begin
        ;; Ensure that only the contract owner can execute this function
        (asserts! (is-eq tx-sender contract-owner) (err u401))  ;; Unauthorized access error

        ;; Check if the series is already marked as infinite; cannot set max mints if so
        (asserts! (var-get is-finite) (err u403))  ;; Can't set max mints for an infinite series

        ;; Update the max mints value
        (var-set max-mints new-max-mints)

        ;; Confirm the update
        (ok true)
    )
)



(define-public (mint (recipient principal))
    (let ((next-token-id (+ (var-get token-id-nonce) u1)))  ;; Calculate the next token ID
        ;; First, check if the series is finite and if the max mints limit has been reached
        (if (and (var-get is-finite)  ;; Check if the series is finite
                 (is-some (var-get max-mints))  ;; Check if there is a max mints limit set
                 (>= (var-get current-mints) (unwrap! (var-get max-mints) (err err-max-mints-reached))))  ;; Check if the current mints reached or exceeded max mints
            (err err-max-mints-reached)  ;; Return an error if max mints are reached
            ;; Else, attempt to mint
            (let ((mint-result (nft-mint? stacksies next-token-id recipient)))  ;; Attempt to mint the NFT
                (match mint-result  ;; Check the result of the mint attempt
                    success  ;; If minting succeeded
                        (begin
                            (var-set token-id-nonce next-token-id)  ;; Update the token-id nonce
                            (var-set current-mints (+ (var-get current-mints) u1))  ;; Update the current mints count
                            (ok next-token-id))  ;; Return the new token ID wrapped in `ok`
                    failure  ;; If minting failed
                        (err err-token-id-failure)  ;; Return the error from the minting function
)))))


;; Function to get the 'is-finite' state
(define-read-only (get-is-finite)
    (ok (var-get is-finite))
)

;; Function to get the 'max-mints' state
(define-read-only (get-max-mints)
    (ok (var-get max-mints))
)

;; Function to get the 'current-mints' state
(define-read-only (get-current-mints)
    (ok (var-get current-mints))
)

;; Function to get the 'initialized' state
(define-read-only (get-initialized)
    (ok (var-get initialized))
)
